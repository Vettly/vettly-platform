using Microsoft.AspNetCore.SignalR;
using Vettly.MessagingService.DTOs;
using Vettly.MessagingService.Hubs;

namespace Vettly.MessagingService.Services;

// Thin wrapper around IHubContext<MessagingHub> so services don't take a SignalR dependency directly.
public class MessagingHubPusher(IHubContext<MessagingHub> hub)
{
    public Task PushMessageAsync(Guid recipientUserId, MessageResponse message) =>
        hub.Clients.Group(MessagingHub.UserGroup(recipientUserId)).SendAsync("message:new", message);

    public Task PushConversationUpdatedAsync(Guid recipientUserId, ConversationSummaryResponse conversation) =>
        hub.Clients.Group(MessagingHub.UserGroup(recipientUserId)).SendAsync("conversation:updated", conversation);

    public Task PushNotificationAsync(Guid recipientUserId, NotificationResponse notification) =>
        hub.Clients.Group(MessagingHub.UserGroup(recipientUserId)).SendAsync("notification:new", notification);
}
