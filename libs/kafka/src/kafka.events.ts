export enum DomainEvents {
    //conversation
    conversation_create = 'conversation.create',
    conversation_socket_message = 'conversation.socket_message',
    conversation_update_unread_count = 'conversation.update_unread_count',
    conversation_socket_unread_count = 'conversation.socket_unread_count',

    //message
    message_send = 'message.send',
    message_send_file = 'message.send_file',

    // fanpages
    FanPage_sync_socket = 'fanPage.sync_soket',
}