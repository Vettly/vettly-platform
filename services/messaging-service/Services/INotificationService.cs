using Vettly.MessagingService.DTOs;
using Vettly.MessagingService.Models;

namespace Vettly.MessagingService.Services;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetMyNotificationsAsync(Guid userId, int limit);
    Task MarkAllReadAsync(Guid userId);
    Task<UnreadSummaryResponse> GetUnreadSummaryAsync(Guid userId);
    Task<Notification> CreateAsync(
        Guid recipientUserId, string type, string title, string? body,
        Guid? jobId = null, Guid? applicationId = null, Guid? conversationId = null);
}
