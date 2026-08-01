using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.MessagingService.Services;
using Vettly.Shared.Middleware;

namespace Vettly.MessagingService.Controllers;

[ApiController]
[Route("api/messaging")]
[Authorize]
public class NotificationsController(INotificationService notificationService) : ControllerBase
{
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] int limit = 20)
    {
        var userId = User.GetUserID();
        var notifications = await notificationService.GetMyNotificationsAsync(userId, Math.Clamp(limit, 1, 100));
        return Ok(notifications);
    }

    [HttpPost("notifications/read")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = User.GetUserID();
        await notificationService.MarkAllReadAsync(userId);
        return NoContent();
    }

    [HttpGet("unread-summary")]
    public async Task<IActionResult> GetUnreadSummary()
    {
        var userId = User.GetUserID();
        var summary = await notificationService.GetUnreadSummaryAsync(userId);
        return Ok(summary);
    }
}
