using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Vettly.Shared.Middleware;

namespace Vettly.MessagingService.Hubs;

[Authorize]
public class MessagingHub : Hub
{
    public static string UserGroup(Guid userId) => $"user:{userId}";

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User!.GetUserID();
        await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
        await base.OnConnectedAsync();
    }
}
