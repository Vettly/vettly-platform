namespace Vettly.Shared.DTOs.Job;

public class UpdatePipelineRequest
{
    public Guid    ApplicationId { get; set; }
    public Guid    CandidateId   { get; set; }
    public string  Stage         { get; set; } = string.Empty;
    public string? Notes         { get; set; }
}