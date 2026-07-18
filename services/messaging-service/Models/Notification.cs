namespace Vettly.MessagingService.Models;

public static class NotificationType
{
    public const string ApplicationReceived = "application_received";
    public const string StageChanged = "stage_changed";
    public const string OfferReady = "offer_ready";
    public const string MessageReply = "message_reply";
}

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RecipientUserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }

    public Guid? JobId { get; set; }
    public Guid? ApplicationId { get; set; }
    public Guid? ConversationId { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
