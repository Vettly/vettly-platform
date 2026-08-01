namespace Vettly.Shared.DTOs.Events;

public class ApplicationReceivedEvent
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateProfileId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
}
