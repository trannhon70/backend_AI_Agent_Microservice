import { NormalizedAttachment } from "../interfaces";

export const expiresIn = '365d' //Refresh Token (365 ngày)

export const REFRESH_TTL = 365 * 24 * 60 * 60; // 365 ngày, khớp expiresIn refresh token

export const accessExpire = 60 * 60; // 1 giờ (giây)

export const CheckObjectFacebook = {
    PAGE: "page",
} as const;


export const normalizeAttachments = (attachments: any[], source: 'webhook' | 'sync'): NormalizedAttachment[] => {
    if (!attachments?.length) return [];

    if (source === 'sync') {
        // attachments từ Graph API: item.attachments?.data
        return attachments.map((att) => ({
            id: att.id ?? null,
            mime_type: att.mime_type ?? null,
            name: att.name ?? null,
            url: att.image_data?.url ?? null,
            preview_url: att.image_data?.preview_url ?? null,
            width: att.image_data?.width ?? null,
            height: att.image_data?.height ?? null,
            image_type: att.image_data?.image_type ?? null,
            render_as_sticker: att.image_data?.render_as_sticker ?? false,
        }));
    }

    if (source === 'webhook') {
        // attachments từ webhook: event.message.attachments
        return attachments.map((att) => ({
            id: null,
            mime_type: resolveMimeType(att.type),
            name: att.type ?? null,
            url: att.payload?.url ?? null,
            preview_url: att.payload?.url ?? null,
            width: null,
            height: null,
            image_type: null,
            render_as_sticker: att.payload?.sticker_id ? true : false,
        }));
    }

    return [];
};

// Map type webhook -> mime_type
const resolveMimeType = (type: string): string | null => {
    const map: Record<string, string> = {
        image: 'image/jpeg',
        video: 'video/mp4',
        audio: 'audio/mpeg',
        file: 'application/octet-stream',
        gif: 'image/gif',
    };
    return map[type] ?? null;
};