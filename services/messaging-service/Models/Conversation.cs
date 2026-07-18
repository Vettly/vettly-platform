namespace Vettly.MessagingService.Models;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? CompanyName { get; set; }

    public Guid CandidateUserId { get; set; }
    public Guid RecruiterUserId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string RecruiterName { get; set; } = string.Empty;

    public string? LastMessagePreview { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public Guid? LastMessageSenderId { get; set; }

    public int CandidateUnreadCount { get; set; }
    public int RecruiterUnreadCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Message> Messages { get; set; } = [];
}
