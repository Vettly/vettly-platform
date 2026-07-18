namespace Vettly.MessagingService.Services;

public class ResolvedParticipants
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public Guid CandidateUserId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public Guid RecruiterUserId { get; set; }
    public string RecruiterName { get; set; } = string.Empty;
}

public class ParticipantResolver(
    CandidateServiceClient candidateClient,
    JobServiceClient jobClient,
    AuthServiceClient authClient,
    ILogger<ParticipantResolver> logger)
{
    public async Task<ResolvedParticipants?> ResolveAsync(Guid applicationId)
    {
        var participants = await candidateClient.GetApplicationParticipantsAsync(applicationId);
        if (participants is null) return null;

        var job = await jobClient.GetJobAsync(participants.JobId);
        if (job is null) return null;

        var recruiterName = job.CompanyName ?? "Recruiter";
        try
        {
            var recruiter = await authClient.GetUserNameAsync(job.RecruiterId);
            if (recruiter is not null)
                recruiterName = $"{recruiter.FirstName} {recruiter.LastName}".Trim();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to resolve recruiter name for {RecruiterId}", job.RecruiterId);
        }

        return new ResolvedParticipants
        {
            ApplicationId = applicationId,
            JobId = job.Id,
            JobTitle = job.Title,
            CompanyName = job.CompanyName,
            CandidateUserId = participants.CandidateUserId,
            CandidateName = $"{participants.CandidateFirstName} {participants.CandidateLastName}".Trim(),
            RecruiterUserId = job.RecruiterId,
            RecruiterName = recruiterName,
        };
    }
}
