import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { firstValueFrom, Observable } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { SyncingTelegramDto } from 'libs/common/dto/telegram/index.dto';
type QrStatus = | 'waiting' | 'success' | 'expired' | 'need_password' | 'error';


interface TelegramUserInfo {
    id: string;
    accessHash?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    premium?: boolean;
    bot?: boolean;
}

interface QrSession {
    client: TelegramClient;
    status: QrStatus;
    sessionString?: string;
    telegramUser?: TelegramUserInfo;
    error?: string;
}

interface TelegramGrpcService {
    ConnectPageTelegram(data: any): Observable<any>;
    Syncing(data: SyncingTelegramDto): Observable<any>;

}

@Injectable()
export class TelegramService implements OnModuleInit {
    private TelegramGrpcService!: TelegramGrpcService;
    private readonly logger = new Logger(TelegramService.name);
    private readonly apiId = Number(process.env.TELEGRAM_API_ID,);
    private readonly apiHash = String(process.env.TELEGRAM_API_HASH,);

    /**Tạm thời lưu trong memory.
     * Production:
     * - sessionString nên lưu DB
     * - trạng thái QR có thể lưu Redis
     * - TelegramClient không nên serialize vào Redis
     */
    private readonly sessions = new Map<string, QrSession>();
    constructor(
        @Inject('FANPAGE_PACKAGE') private readonly client: ClientGrpc,
    ) { }
    onModuleInit() {
        this.TelegramGrpcService = this.client.getService<TelegramGrpcService>('TelegramService');
    }

    /** Tạo QR login*/
    async createQrLogin(dto: any) {
        const { sessionId, user_id } = dto
        if (!this.apiId || !this.apiHash) {
            throw new Error('TELEGRAM_API_ID / TELEGRAM_API_HASH chưa được cấu hình',);
        }
        this.logger.log(`[QR] Creating Telegram QR login: ${sessionId}`,);

        /** StringSession rỗng vì đây là login account mới.*/
        const client = new TelegramClient(new StringSession(''), this.apiId, this.apiHash, { connectionRetries: 5, },);
        /** Connect Telegram. */
        await client.connect();
        this.logger.log(`[QR] Telegram client connected: ${sessionId}`,);
        /** Lưu client vào memory.*/
        this.sessions.set(sessionId, { client, status: 'waiting', });

        /** Xin LoginToken. */
        const result = await client.invoke(new Api.auth.ExportLoginToken({ apiId: this.apiId, apiHash: this.apiHash, exceptIds: [], }),);
        /** Telegram phải trả LoginToken.*/
        if (!(result instanceof Api.auth.LoginToken)) {
            this.logger.error(`[QR] Cannot generate LoginToken: ${result.className}`);
            await client.disconnect();
            this.sessions.delete(sessionId);
            throw new Error('Cannot generate Telegram QR',);
        }

        /**Token hết hạn tính theo Unix seconds. */
        const expiresAt = Number(result.expires) * 1000;

        /** Convert token -> base64url. */
        const token = result.token.toString('base64url',);
        const qrUrl = `tg://login?token=${token}`;
        this.logger.log(`[QR] QR generated successfully: ${sessionId}`,);
        this.logger.log(`[QR] Expires: ${new Date(expiresAt,).toISOString()}`);

        /** Bắt đầu theo dõi UpdateLoginToken. Không ExportLoginToken liên tục. */
        this.watchLoginResult(sessionId, expiresAt, user_id).catch((error) => {
            this.logger.error(`[QR] Watch failed [${sessionId}]`, error?.stack || error?.message,);
        });

        return { sessionId, qrUrl, expiresAt, status: 'waiting' as QrStatus, };
    }

    /*** STEP 2 * Theo dõi UpdateLoginToken*/
    private async watchLoginResult(sessionId: string, expiresAt: number, user_id: number) {
        const entry = this.sessions.get(sessionId);
        if (!entry) {
            this.logger.warn(`[QR] Session not found: ${sessionId}`,);
            return;
        }

        const { client } = entry;
        await new Promise<void>((resolve) => {
            let settled = false;
            /*** Cleanup handler.*/
            const cleanup = () => { client.removeEventHandler(handler, undefined as any,); };

            /** QR timeout. */
            const timeout = setTimeout(() => {
                if (settled) { return; }
                settled = true;
                cleanup();
                this.logger.warn(`[QR] QR expired: ${sessionId}`,);
                this.sessions.set(sessionId, { client, status: 'expired', });
                resolve();
            }, Math.max(0, expiresAt - Date.now()));

            /** Telegram update handler.  */
            const handler = async (update: any,) => {
                if (settled) { return; }
                this.logger.debug(`[QR] Update received [${sessionId}]: ${update?.className}`,);
                /** Chỉ xử lý UpdateLoginToken.  */
                if (update?.className !== 'UpdateLoginToken') { return; }
                /**Chỉ xử lý một lần. */
                settled = true;
                clearTimeout(timeout);
                cleanup();
                try {
                    /**Telegram thông báo token đã được scan. Lúc này mới ExportLoginToken lần 2. */
                    this.logger.log(`[QR] Token scanned. Exporting login token again [${sessionId}]`);
                    const result = await client.invoke(new Api.auth.ExportLoginToken(
                        { apiId: this.apiId, apiHash: this.apiHash, exceptIds: [] }));

                    this.logger.log(`[QR] Export result [${sessionId}]: ${result.className}`,);

                    /*** CASE 1 * LoginTokenSuccess * =================================================*/
                    if (result instanceof Api.auth.LoginTokenSuccess) {
                        await this.handleLoginSuccess(sessionId, client, user_id);
                        resolve();
                        return;
                    }

                    /*** CASE 2* LoginTokenMigrateTo*/
                    if (result instanceof Api.auth.LoginTokenMigrateTo) {
                        await this.handleMigration(sessionId, client, result, user_id);
                        resolve();
                        return;
                    }

                    /** Không phải result mình mong đợi. */
                    this.logger.error(`[QR] Unexpected login result [${sessionId}]: ${result.className}`);

                    this.sessions.set(sessionId,
                        {
                            client,
                            status: 'error',
                            error: `Unexpected Telegram result: ${result.className}`,
                        },
                    );
                    resolve();
                } catch (error: any) {
                    await this.handleLoginError(sessionId, client, error,);
                    resolve();
                }
            };

            /**Đăng ký Telegram update handler. */
            client.addEventHandler(handler,);
        });
    }

    /*** HANDLE LOGIN SUCCESS */
    private async handleLoginSuccess(sessionId: string, client: TelegramClient, user_id: number) {
        this.logger.log(`[QR] Login success [${sessionId}]`);
        /** Lấy user Telegram */
        const me = await client.getMe();

        /** Kiểm tra user. */
        if (!me) { throw new Error('Telegram login success nhưng không lấy được user',); }



        /** Lưu session Đây là credential rất nhạy cảm.  * Không trả sessionString về frontend. */
        const sessionString = (client.session as StringSession).save();

        /**Convert Telegram User -> object sạch để lưu DB / trả API.*/
        const telegramUser: any = {
            id: me.id.toString(),
            accessHash: me.accessHash?.toString(),
            username: me.username,
            firstName: me.firstName,
            lastName: me.lastName,
            phone: me.phone,
            premium: me.premium,
            bot: me.bot,
            user_id: user_id,
            sessionId: sessionString
        };
        /**Log user. Không log sessionString. */
        this.logger.log(`[TELEGRAM USER] ${JSON.stringify(telegramUser,)}`);
        await firstValueFrom(this.TelegramGrpcService.ConnectPageTelegram(telegramUser));


        /*** Lưu trạng thái vào memory. */
        this.sessions.set(sessionId, { client, status: 'success', sessionString, telegramUser, });

        this.logger.log(`[QR] Telegram account stored successfully [${sessionId}]`,);
    }

    /** HANDLE MIGRATION*/
    private async handleMigration(sessionId: string, client: TelegramClient, result: Api.auth.LoginTokenMigrateTo, user_id: number) {
        this.logger.log(`[QR] Telegram requires migration [${sessionId}]`,);
        this.logger.log(`[QR] Target DC: ${result.dcId}`);

        /** Switch Telegram client sang DC tương ứng.* GramJS hiện expose _switchDC nội bộ,* nên cần cast any.*/
        await (client as any)._switchDC(result.dcId,);

        this.logger.log(`[QR] Switched to DC ${result.dcId} [${sessionId}]`);

        /**Import token ở DC mới. */
        const migrated = await client.invoke(new Api.auth.ImportLoginToken({ token: result.token, }),);

        this.logger.log(`[QR] ImportLoginToken result [${sessionId}]: ${migrated.className}`,);

        /** Debug nếu cần.Không log token. */
        this.logger.debug(`[QR] Import result class: ${migrated.className}`,);

        /**Login thành công sau migration*/
        if (migrated instanceof Api.auth.LoginTokenSuccess) {
            await this.handleLoginSuccess(sessionId, client, user_id);
            return;
        }

        /**Trường hợp Telegram trả Authorization* hoặc result khác.*/
        this.logger.error(`[QR] ImportLoginToken did not return LoginTokenSuccess: ${migrated.className}`,);
        this.sessions.set(sessionId, { client, status: 'error', error: `ImportLoginToken returned ${migrated.className}` },);
    }

    /** HANDLE ERROR*/
    private async handleLoginError(sessionId: string, client: TelegramClient, error: any,) {
        const errorMessage = error?.errorMessage || error?.message || 'Unknown Telegram error';
        this.logger.error(`[QR] Login error [${sessionId}]: ${errorMessage}`, error?.stack,);

        /** Telegram account bật 2FA.   */
        if (errorMessage === 'SESSION_PASSWORD_NEEDED') {
            this.sessions.set(sessionId, { client, status: 'need_password', },);
            this.logger.warn(`[QR] Telegram 2FA password required [${sessionId}]`,);
            return;
        }

        /** Error bình thường. */
        this.sessions.set(sessionId, { client, status: 'error', error: errorMessage, },);
    }

    /** STEP 3 * Frontend polling status*/
    getQrStatus(sessionId: string) {
        const entry = this.sessions.get(sessionId);
        console.log(entry, 'entry');

        /** Không tồn tại.  */
        if (!entry) {
            return { status: 'not_found' as const, };
        }

        /** Chỉ trả những gì frontend cần. Tuyệt đối không trả sessionString. */
        return {
            status: entry.status,
            user: entry.telegramUser
                ? {
                    id: entry.telegramUser.id,
                    accessHash: entry.telegramUser.accessHash,
                    username: entry.telegramUser.username,
                    firstName: entry.telegramUser.firstName,
                    lastName: entry.telegramUser.lastName,
                    phone: entry.telegramUser.phone,
                    premium: entry.telegramUser.premium,
                    bot: entry.telegramUser.bot,
                }
                : undefined,

            error: entry.status === 'error' ? entry.error : undefined,
        };
    }

    /**
     * Lấy sessionString server-side
     * Dùng nội bộ để lưu DB.
     * Không expose endpoint trực tiếp cho frontend.
     */
    getSessionString(sessionId: string,) {
        const entry = this.sessions.get(sessionId);
        if (!entry) { return null; }
        return (entry.sessionString ?? null);
    }

    /*** Lấy Telegram user server-side*/
    getTelegramUser(sessionId: string,) {
        const entry = this.sessions.get(sessionId);
        if (!entry) { return null; }
        return (entry.telegramUser ?? null);
    }

    /** Cleanup session */
    async deleteQrSession(sessionId: string,) {
        const entry = this.sessions.get(sessionId);
        if (!entry) { return; }
        try {
            await entry.client.disconnect();
        } catch (error) {
            this.logger.warn(`[QR] Disconnect failed [${sessionId}]`,);
        }
        this.sessions.delete(sessionId,);
        this.logger.log(`[QR] Session deleted [${sessionId}]`);
    }

    async syncing(dto: SyncingTelegramDto) {
        return firstValueFrom(this.TelegramGrpcService.Syncing(dto));
    }
}