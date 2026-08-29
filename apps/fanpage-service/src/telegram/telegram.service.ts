import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage, SyncStatus } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { UserPage } from '@app/database/entities/user_page.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SOCKET_EMIT_CHANNEL } from 'libs/common/constants/redis.constants';
import { SyncingTelegramDto } from 'libs/common/dto/telegram/index.dto';
import { MessageDirection, MessageType, ProviderEnum, RoleEnumUserPage } from 'libs/common/enums/role.enum';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { RedisService } from 'libs/redis/redis.service';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Repository } from 'typeorm';
import pLimit from 'p-limit';
const limit = pLimit(5);
const ONE_DAY = 24 * 60 * 60;

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly apiId = Number(process.env.TELEGRAM_API_ID,);
    private readonly apiHash = String(process.env.TELEGRAM_API_HASH,);
    constructor(

        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(UserPage)
        private readonly userPageRepo: Repository<UserPage>,


        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,

        @InjectRepository(LiveMessage)
        private readonly liveMessageRepo: Repository<LiveMessage>,


        private readonly redisService: RedisService,

    ) { }
    private async createTelegramClient(sessionString: string): Promise<TelegramClient> {
        const session = new StringSession(sessionString,);
        const client = new TelegramClient(
            session,
            this.apiId,
            this.apiHash,
            {
                connectionRetries: 5,
            },
        );
        await client.connect();
        const me = await client.getMe();
        this.logger.log(`Telegram connected: ${me.id.toString()}`);
        return client;
    }
    async ConnectPageTelegram(dto: any) {
        const { id, accessHash, username, firstName, phone, premium, bot, user_id, sessionId } = dto;
        let page: any = await this.fanpageRepo.findOne({
            where: { page_id: id },
        });

        if (!page) {
            page = await this.fanpageRepo.save({          // ← đổi create → save
                user_id: user_id,
                page_id: id,
                page_name: firstName,
                access_token: sessionId,
                page_platform: 'telegram',
                created_at: currentTimestamp(),
            });
            // page.id giờ đã có giá trị thật từ DB

            await this.pageTokenRepo.save({
                fanpage_id: page.id,
                access_token: sessionId,
                created_at: currentTimestamp(),
            });
        }

        // Update lại thông tin page
        await this.fanpageRepo.update(
            { id: page.id },
            {
                page_name: firstName,
                access_token: sessionId,
            },
        );

        await this.pageTokenRepo.update({ fanpage_id: page.id }, {
            access_token: sessionId,
        });

        await this.userPageRepo.upsert({
            user_id: user_id,
            fanpage_id: page.id,
            provider: ProviderEnum.TELEGRAM,
            role: RoleEnumUserPage.ADMIN_MANAGE,
            created_at: currentTimestamp(),
        }, { conflictPaths: ["user_id", "fanpage_id"] });

        return;
    }

    async Syncing(dto: SyncingTelegramDto) {
        await this.updateSyncStatus(dto.page_id, SyncStatus.SYNCING);
        let client: TelegramClient | undefined;
        try {
            const fanpage = await this.fanpageRepo.findOneOrFail({
                where: { page_id: dto.page_id },
            });

            const sessionString = fanpage.access_token;
            if (!sessionString || typeof sessionString !== 'string') {
                throw new Error(`Invalid session string for page_id ${dto.page_id}`);
            }

            client = await this.createTelegramClient(sessionString);
            const me = await client.getMe();
            const telegramSelfId = me.id.toString();

            const rawDialogs = await client.getDialogs({ limit: 100 });
            const dialogs = await this.mapDialogsForDisplay(client, rawDialogs);
            const conversationIdMap = await this.syncConversations(dto.page_id, dialogs);

            await this.syncMessages(client, rawDialogs, conversationIdMap, telegramSelfId);

            await this.updateSyncStatus(dto.page_id, SyncStatus.SUCCESS);
        } catch (error: any) {
            this.logger.error(`Syncing failed for page_id ${dto.page_id}`, error?.stack);
            await this.updateSyncStatus(dto.page_id, SyncStatus.FAILED);
            throw error;
        } finally {
            // Luôn disconnect dù thành công hay lỗi — tránh leak client + update loop chạy nền
            if (client) {
                await client.disconnect().catch((err) =>
                    this.logger.warn(`Disconnect Telegram client failed: ${err?.message}`),
                );
            }
        }
    }

    async getDialogs(client: TelegramClient) {
        const dialogs = await client.getDialogs({ limit: 100 });
        return dialogs.map((dialog: any) => ({
            id: dialog.id?.toString(),
            // group/channel dùng title, user 1-1 dùng name
            displayName: dialog.name ?? dialog.title ?? 'Unknown',
            unreadCount: dialog.unreadCount ?? 0,
            pinned: !!dialog.pinned,
            isUser: !!dialog.isUser,
            isGroup: !!dialog.isGroup,
            isChannel: !!dialog.isChannel,
        }));
    }

    async syncConversations(page_id: string, dialogs: any[]) {
        const conversationIdMap = new Map<string, number>();

        for (const dialog of dialogs) {
            await this.conversationRepo.upsert(
                {
                    page_id: page_id,
                    customer_id: dialog.id,
                    full_name: dialog.displayName,
                    avatar: dialog.avatarUrl,
                    created_at: currentTimestamp(),
                    updated_at: currentTimestamp(),
                },
                { conflictPaths: ['page_id', 'customer_id'] },
            );

            const conv = await this.conversationRepo.findOne({
                where: { page_id, customer_id: dialog.id },
            });
            if (conv) conversationIdMap.set(dialog.id, conv.id);
        }

        return conversationIdMap;
    }
    private detectMessageType(msg: any): MessageType {
        if (!msg.media) return MessageType.TEXT;

        const mediaClass = msg.media.className;

        if (mediaClass === 'MessageMediaPhoto') {
            return MessageType.IMAGE;
        }

        if (mediaClass === 'MessageMediaDocument') {
            const doc = msg.media.document;
            const mimeType: string = doc?.mimeType ?? '';

            // Sticker được đánh dấu qua attribute riêng, không phải mimeType
            const isSticker = doc?.attributes?.some(
                (attr: any) => attr.className === 'DocumentAttributeSticker',
            );
            if (isSticker) return MessageType.STICKER;

            if (mimeType.startsWith('audio/')) return MessageType.AUDIO;
            if (mimeType.startsWith('video/')) return MessageType.VIDEO;

            return MessageType.FILE;
        }

        // MessageMediaWebPage, MessageMediaGeo, MessageMediaContact...
        // tạm coi là text (vì msg.message thường vẫn có caption/link)
        return MessageType.TEXT;
    }
    private mapTelegramMessage(
        msg: any,
        conversationId: number,
        telegramSelfId: string,
    ): Partial<LiveMessage> {
        const isOutbound = !!msg.out; // tài khoản Telegram đã connect gửi đi = STAFF
        const peerUserId = msg.peerId?.userId?.toString?.() ?? msg.fromId?.userId?.toString?.() ?? '';

        return {
            conversation_id: conversationId,
            facebook_mid: `tg_${conversationId}_${msg.id}`,
            sender_id: isOutbound ? telegramSelfId : peerUserId,
            recipient_id: isOutbound ? peerUserId : telegramSelfId,
            direction: isOutbound ? MessageDirection.STAFF : MessageDirection.CUSTOMER,
            type: this.detectMessageType(msg),
            text: msg.message || null,
            attachments: [], // vẫn để trống — chờ bạn confirm có sync media ngay không
            raw_data: msg,
            sent_at: msg.date,
            created_at: currentTimestamp(),
            reply_to_id: msg.replyTo?.replyToMsgId
                ? `tg_${conversationId}_${msg.replyTo.replyToMsgId}`
                : null,
        };
    }

    private async syncMessages(
        client: TelegramClient,
        rawDialogs: any[],
        conversationIdMap: Map<string, number>,
        telegramSelfId: string,
    ) {
        const msgLimit = pLimit(3); // đổi tên để không đè lên `limit` module-level

        await Promise.all(
            rawDialogs.map((dialog: any) =>
                msgLimit(async () => {
                    const conversationId = conversationIdMap.get(dialog.id?.toString());
                    if (!conversationId) return; // dialog chưa sync được conversation thì bỏ qua

                    try {
                        const messages = await client.getMessages(dialog.entity, { limit: 50 });

                        for (const msg of messages) {
                            if (!msg.message && !msg.media) continue;
                            const mapped = this.mapTelegramMessage(msg, conversationId, telegramSelfId);
                            await this.liveMessageRepo.upsert(mapped, { conflictPaths: ['facebook_mid'] });
                        }
                    } catch (error: any) {
                        this.logger.warn(`Lỗi lấy message cho dialog ${dialog.id}: ${error?.message}`);
                    }
                }),
            ),
        );
    }

    private async mapDialogsForDisplay(client: TelegramClient, rawDialogs: any[]) {
        const limit = pLimit(5);

        return Promise.all(
            rawDialogs.map((dialog: any) =>
                limit(async () => {
                    // const avatarUrl = await this.getDialogAvatar(client, dialog);
                    const avatarUrl = null;

                    return {
                        id: dialog.id?.toString(),
                        displayName: dialog.name ?? dialog.title ?? 'Unknown',
                        unreadCount: dialog.unreadCount ?? 0,
                        pinned: !!dialog.pinned,
                        isUser: !!dialog.isUser,
                        isGroup: !!dialog.isGroup,
                        isChannel: !!dialog.isChannel,
                        avatarUrl,
                    };
                }),
            ),
        );
    }

    private async getDialogAvatar(client: TelegramClient, dialog: any): Promise<string | null> {
        try {
            // Không phải dialog nào cũng có ảnh đại diện
            if (!dialog.entity?.photo) {
                return null;
            }

            const buffer = await client.downloadProfilePhoto(dialog.entity, {
                isBig: false, // false = thumbnail nhỏ, đủ dùng cho avatar list
            });

            if (!buffer || (buffer as Buffer).length === 0) {
                return null;
            }

            // Upload lên Cloudinary, trả về secure_url
            // const uploadResult = await this.cloudinaryService.uploadBuffer(
            //     buffer as Buffer,
            //     `telegram/avatars/${dialog.id?.toString()}`,
            // );

            // return uploadResult.secure_url;
            return ""
        } catch (error: any) {
            this.logger.warn(
                `Không lấy được avatar cho dialog ${dialog.id}: ${error?.message}`,
            );
            return null;
        }
    }
    async updateSyncStatus(page_id: string, status: SyncStatus,) {
        await this.fanpageRepo.update({ page_id: page_id }, { syncStatus: status });
        await this.redisService.publish(SOCKET_EMIT_CHANNEL, { page_id, syncStatus: status });

    }
}