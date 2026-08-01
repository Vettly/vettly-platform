using Microsoft.EntityFrameworkCore;
using Vettly.MessagingService.Data;
using Vettly.MessagingService.DTOs;
using Vettly.MessagingService.Models;

namespace Vettly.MessagingService.Services;

public class NotificationService(MessagingDbContext db, MessagingHubPusher hubPusher) : INotificationService
{
    public async Task<List<NotificationResponse>> GetMyNotificationsAsync(Guid userId, int limit)
    {
        var notifications = await db.Notifications
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return notifications.Select(MapNotification).ToList();
    }

    public async Task MarkAllReadAsync(Guid userId)
    {
        await db.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(set => set.SetProperty(n => n.IsRead, true));
    }

    public async Task<UnreadSummaryResponse> GetUnreadSummaryAsync(Guid userId)
    {
        var messageUnread = await db.Conversations
            .Where(c => c.CandidateUserId == userId || c.RecruiterUserId == userId)
            .SumAsync(c => c.CandidateUserId == userId ? c.CandidateUnreadCount : c.RecruiterUnreadCount);

        var notificationUnread = await db.Notifications
            .CountAsync(n => n.RecipientUserId == userId && !n.IsRead);

        return new UnreadSummaryResponse
        {
            Messages = messageUnread,
            Notifications = notificationUnread,
        };
    }

    public async Task<Notification> CreateAsync(
        Guid recipientUserId, string type, string title, string? body,
        Guid? jobId = null, Guid? applicationId = null, Guid? conversationId = null)
    {
        var notification = new Notification
        {
            RecipientUserId = recipientUserId,
            Type = type,
            Title = title,
            Body = body,
            JobId = jobId,
            ApplicationId = applicationId,
            ConversationId = conversationId,
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        await hubPusher.PushNotificationAsync(recipientUserId, MapNotification(notification));

        return notification;
    }

    private static NotificationResponse MapNotification(Notification n) => new()
    {
        Id = n.Id,
        Type = n.Type,
        Title = n.Title,
        Body = n.Body,
        JobId = n.JobId,
        ApplicationId = n.ApplicationId,
        ConversationId = n.ConversationId,
        IsRead = n.IsRead,
        CreatedAt = n.CreatedAt,
    };
}
