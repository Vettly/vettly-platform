namespace Vettly.Shared.DTOs.Job;

public class PipelineStageResponse
{
    public Guid     Id            { get; set; }
    public Guid     JobId         { get; set; }
    public Guid     ApplicationId { get; set; }
    public Guid     CandidateId   { get; set; }
    public string   Stage         { get; set; } = string.Empty;
    public string?  Notes         { get; set; }
    public Guid?    MovedBy       { get; set; }
    public DateTime MovedAt       { get; set; }
}