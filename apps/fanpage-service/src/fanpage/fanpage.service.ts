import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateConnectFanPageFacebookDto, TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { ProviderEnum, RoleEnumUserPage } from 'libs/common/enums/role.enum';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { PageToken } from '@app/database/entities/page_token.entity';
import { FanPagesRepository } from './fanpages.repository';

@Injectable()
export class FanPageService {

    constructor(
        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(UserPage)
        private readonly userPageRepo: Repository<UserPage>,

        private readonly fanPagesRepoConfig: FanPagesRepository,

        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
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


}