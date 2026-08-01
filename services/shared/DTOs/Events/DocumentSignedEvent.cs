namespace Vettly.Shared.DTOs.Events;

public class DocumentSignedEvent
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public Guid RecruiterUserId { get; set; }
}
