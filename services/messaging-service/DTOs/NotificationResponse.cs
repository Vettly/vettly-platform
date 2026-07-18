namespace Vettly.MessagingService.DTOs;

public class NotificationResponse
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public Guid? JobId { get; set; }
    public Guid? ApplicationId { get; set; }
    public Guid? ConversationId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
