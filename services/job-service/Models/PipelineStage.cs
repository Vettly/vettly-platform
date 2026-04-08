namespace Vettly.JobService.Models;

public class PipelineStage
{
    public Guid    Id            { get; set; } = Guid.NewGuid();
    public Guid    JobId         { get; set; }
    public Guid    ApplicationId { get; set; } // from candidate-service
    public Guid    CandidateId   { get; set; } // from candidate-service
    public string  Stage         { get; set; } = string.Empty;
    // applied | screening | matched | interview | offer | hired | rejected
    public string? Notes         { get; set; }
    public Guid?   MovedBy       { get; set; } // recruiter user_id
    public DateTime MovedAt      { get; set; } = DateTime.UtcNow;

    public JobPosting Job { get; set; } = null!;
}