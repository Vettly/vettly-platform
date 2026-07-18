namespace Vettly.Shared.DTOs.Events;

public class StageChangedEvent
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public Guid CandidateProfileId { get; set; }
    public string Stage { get; set; } = string.Empty;
    public Guid RecruiterUserId { get; set; }
}
