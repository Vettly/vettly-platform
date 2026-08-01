namespace Vettly.MessagingService.DTOs;

public class ApplicationParticipantsResponse
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateUserId { get; set; }
    public string CandidateFirstName { get; set; } = string.Empty;
    public string CandidateLastName { get; set; } = string.Empty;
}
