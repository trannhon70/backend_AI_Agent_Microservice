
//owner: Chủ hệ thống | ADMIN_MANAGE: Quản trị viên | SALE: Nhân viên kinh doanh | CSKH: Nhân viên chăm sóc khách hàng
export enum RoleEnum {
    OWNER = 1,
    ADMIN_MANAGE = 2,
    SALE = 3,
    CSKH = 4,
}

export enum RoleEnumUserPage {
    ADMIN_MANAGE = 'Admin Manager',
    SALE = 'Sale',
    CSKH = 'CSKH',
}

export enum ProviderEnum {
    LOCAL = 'local',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    GITHUB = 'github',
    APPLE = 'apple',
}

export enum MessageDirection {
    STAFF = 'staff',   // tin nhắn từ nhân viên
    CUSTOMER = 'customer', //tin nhắn từ khách hàng
    AUTO = 'auto', // tin nhắn auto
    AI = 'ai', // AI trả lời
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    FILE = 'file',
    STICKER = 'sticker',
}
