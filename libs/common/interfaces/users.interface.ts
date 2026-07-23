export interface GetByIdUserRequest {
    user_id: number;
}

export interface UserResponse {
    id: number;
    full_name: string;
    email: string;
    avatar: string;
    is_online: boolean;
    created_at: number;
    role: any;
}