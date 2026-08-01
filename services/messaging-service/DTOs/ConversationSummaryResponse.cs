namespace Vettly.MessagingService.DTOs;

public class ConversationSummaryResponse
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string OtherPartyName { get; set; } = string.Empty;
    public string? LastMessagePreview { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}
