import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage, SyncStatus } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { UserPage } from '@app/database/entities/user_page.entity';
import { KafkaService } from '@app/kafka';
import { SocketService } from '@app/socket';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateConnectFanPageFacebookDto, SyncingDto, TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';
import { MessageDirection, MessageType, ProviderEnum, RoleEnumUserPage } from 'libs/common/enums/role.enum';
import { normalizeAttachments, toUnixTimestamp } from 'libs/common/utils';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, Repository } from 'typeorm';
import { FanPagesRepository } from './fanpages.repository';
import { DomainEvents } from '@app/kafka/kafka.events';

@Injectable()
export class FanPageService {

    constructor(
        // @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(UserPage)
        private readonly userPageRepo: Repository<UserPage>,

        private readonly fanPagesRepoConfig: FanPagesRepository,

        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,

        @InjectRepository(LiveMessage)
        private readonly liveMessageRepo: Repository<LiveMessage>,

        private readonly kafkaService: KafkaService,
        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
        private readonly socketService: SocketService,
    ) { }

    async exchangeLongLivedToken(shortLivedToken: string) {
        const url = new URL(
            'https://graph.facebook.com/v25.0/oauth/access_token',
        );

        url.searchParams.append('grant_type', 'fb_exchange_token');
        url.searchParams.append('client_id', process.env.FACEBOOK_APP_ID!);
        url.searchParams.append('client_secret', process.env.FACEBOOK_APP_SECRET!);
        url.searchParams.append('fb_exchange_token', shortLivedToken);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        return await response.json();
    }

    async debugToken(inputToken: string) {
        const url = new URL('https://graph.facebook.com/debug_token');
        url.searchParams.append('input_token', inputToken);
        url.searchParams.append(
            'access_token',
            `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
        );
        const response = await fetch(url.toString());
        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }
        return await response.json();
    }

    async CreateConnectPageFacebook(payload: CreateConnectFanPageFacebookDto) {
        // tiến hành long token lên thời gian tối đa khoảng 90 ngày
        const token = await this.exchangeLongLivedToken(payload.access_token);
        const debugToken = await this.debugToken(token.access_token);

        // // ✅ lấy danh sách page kết nối facebook
        const result = await fetch(
            'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category,picture.type(large),access_token',
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`, // <-- fix ở đây
                },
            }
        );

        const fanpages = await result.json();

        const pages = fanpages?.data?.map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.picture?.data?.url,
            provider: ProviderEnum.FACEBOOK,
            access_token: item.access_token,
        }));

        for (const item of pages) {
            let page: any = await this.fanpageRepo.findOne({
                where: {
                    page_id: item.id,
                },
            });

            if (!page) {
                page = await this.fanPagesRepoConfig.create({
                    page_id: item.id,
                    page_name: item.name,
                    page_avatar: item.url,
                    access_token: token.access_token,
                    data_access_expires_at: debugToken.data.data_access_expires_at,
                    user_id: payload.user_id,
                    created_at: currentTimestamp(),
                });

                await this.pageTokenRepo.save({
                    fanpage_id: page.id,
                    access_token: item.access_token,
                    created_at: currentTimestamp(),
                });
            }
            // Update lại thông tin page
            await this.fanpageRepo.update(
                { id: page.id },
                {
                    page_name: item.name,
                    page_avatar: item.url,
                    access_token: token.access_token,
                    data_access_expires_at: debugToken.data.data_access_expires_at,
                },
            );

            await this.pageTokenRepo.update({ fanpage_id: page.id }, {
                access_token: item.access_token,
            })


            await this.userPageRepo.upsert({
                user_id: payload.user_id,
                fanpage_id: page.id, // ✅ ID trong DB
                provider: item.provider,
                role: RoleEnumUserPage.ADMIN_MANAGE,
                created_at: currentTimestamp(),
            }, { conflictPaths: ["user_id", "fanpage_id"] });

            //subscribed lấy token của page
            await fetch(
                `https://graph.facebook.com/v23.0/${item.id}/subscribed_apps?access_token=${item.access_token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        subscribed_fields: ["messages", "messaging_postbacks", "message_deliveries"],
                    }),
                }
            );
        }
    }

    async TokenRenewal(payload: TokenRenewalFacebookDto) {
        // tiến hành long token lên thời gian tối đa khoảng 90 ngày
        const token = await this.exchangeLongLivedToken(payload.access_token);
        const debugToken = await this.debugToken(token.access_token);

        // // ✅ lấy danh sách page kết nối facebook
        const result = await fetch(
            'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category,picture.type(large),access_token',
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`, // <-- fix ở đây
                },
            }
        );

        const fanpages = await result.json();
        const pages = fanpages?.data?.map((item: any) => ({
            id: item.id,
            access_token: item.access_token,
        }));

        for (const item of pages) {

            await this.fanpageRepo.update({ id: payload.fanpage_id }, {
                access_token: token.access_token,
                data_access_expires_at: debugToken.data.data_access_expires_at,
            });

            await this.pageTokenRepo.update({ fanpage_id: payload.fanpage_id }, {
                access_token: item.access_token,
            });
        }
    }

    async GetPageId(param: any) {
        const result = await this.fanpageRepo.findOne({ where: { page_id: param.id } })
        return result
    }

    async Syncing(payload: SyncingDto) {
        // Bắt đầu đồng bộ và thực hiện socket
        await this.updateSyncStatus(payload.page_id, SyncStatus.SYNCING)

        try {
            // Lấy thông tin fanpage
            const fanpage = await this.fanpageRepo.findOneOrFail({
                where: { page_id: payload.page_id },
            });

            // Lấy access token của page
            const pageToken = await this.pageTokenRepo.findOneOrFail({
                where: { fanpage_id: fanpage.id },
            });

            // Lấy danh sách conversations kèm participants
            const response = await fetch(
                `https://graph.facebook.com/v23.0/${payload.page_id}/conversations?fields=id,updated_time,message_count,participants`,
                {
                    headers: {
                        Authorization: `Bearer ${pageToken.access_token}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Không thể lấy danh sách conversations.');
            }

            const { data: conversations } = await response.json();

            for (const conversation of conversations) {
                // Lấy người dùng (loại bỏ fanpage)
                const customer = conversation.participants.data.find(
                    (participant: any) => participant.id !== payload.page_id,
                );
                //lấy thông tin chi tiết theo từng PSId
                const response_profile = await fetch(
                    `https://graph.facebook.com/v23.0/${customer?.id}?fields=name,profile_pic`,
                    {
                        headers: {
                            Authorization: `Bearer ${pageToken.access_token}`,
                        },
                    },
                );
                const profile = await response_profile.json();

                const save_conversation = await this.conversationRepo.upsert({
                    page_id: payload.page_id,
                    customer_id: customer?.id,
                    avatar: profile.profile_pic,
                    full_name: customer?.name,
                    created_at: currentTimestamp(),
                    updated_at: currentTimestamp(),
                }, { conflictPaths: ["page_id", "customer_id"] })

                const conversation_id = save_conversation.generatedMaps[0].id;
                // lấy dữ liệu tin nhắn từ facebook thông qua conversation.id
                const response_message = await fetch(
                    `https://graph.facebook.com/v23.0/${conversation.id}/messages?fields=id,from,to,message,created_time,attachments`,
                    {
                        headers: {
                            Authorization: `Bearer ${pageToken.access_token}`,
                        },
                    },
                );

                const message = await response_message.json();

                const save_message = message.data.reverse().map((item: any) => {
                    const sender_id = item.from?.id;
                    const recipient_id = item.to?.data?.[0]?.id;
                    const direction = String(sender_id) === String(customer.id) ? MessageDirection.CUSTOMER : MessageDirection.STAFF;
                    let type = MessageType.TEXT;

                    if (item.attachments?.data?.length) {
                        const attachment = item.attachments.data[0];

                        if (attachment.mime_type?.startsWith("image")) {
                            type = MessageType.IMAGE;
                        } else if (attachment.mime_type?.startsWith("video")) {
                            type = MessageType.VIDEO;
                        } else if (attachment.mime_type?.startsWith("audio")) {
                            type = MessageType.AUDIO;
                        } else {
                            type = MessageType.FILE;
                        }
                    }
                    return {
                        conversation_id: conversation_id,
                        facebook_mid: item.id,
                        sender_id: sender_id,
                        recipient_id: recipient_id,
                        direction: direction,
                        type,
                        text: item.message ?? null,
                        attachments: normalizeAttachments(item.attachments?.data, 'sync'),
                        raw_data: item,
                        user_id: null,
                        sent_at: toUnixTimestamp(item.created_time),
                        created_at: currentTimestamp(),
                    }

                })
                await this.liveMessageRepo
                    .createQueryBuilder()
                    .insert()
                    .into(LiveMessage)
                    .values(save_message)
                    .orIgnore() // bỏ qua nếu facebook_mid đã tồn tại
                    .execute();
                //note 
                //     conversation_id: conversation.id, //id của conversation facebook có dạng như này t_1520494776272062
                //     customer_id: customer?.id, //PSID của user nhắn tin cho fanpage
                //     customer_name: customer?.name,//full_name của user nhắn tin cho fanpage
                //     updated_time: conversation.updated_time,
                //     message_count: conversation.message_count,//số lượng tin nhắn của user đã gửi
                //     avatar: profile.profile_pic

            }
            // Đồng bộ thành công

            await this.updateSyncStatus(payload.page_id, SyncStatus.SUCCESS)
        } catch (error) {
            // Có lỗi
            await this.updateSyncStatus(payload.page_id, SyncStatus.FAILED)

            throw error;
        }
    }

    async updateSyncStatus(page_id: string, status: SyncStatus,) {
        await this.fanpageRepo.update({ page_id: page_id }, { syncStatus: status });
        this.kafkaService.publish(DomainEvents.FanPage_sync_socket, {
            page_id,
            syncStatus: status,
        });
    }

}