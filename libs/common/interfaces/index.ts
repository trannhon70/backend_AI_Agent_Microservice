export interface NormalizedAttachment {
    id: string | null;
    mime_type: string | null;
    name: string | null;
    url: string | null;
    preview_url: string | null;
    width: number | null;
    height: number | null;
    image_type: number | null;
    render_as_sticker: boolean;
}