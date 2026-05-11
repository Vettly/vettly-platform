namespace Vettly.Shared.DTOs.Job;

public class CreateJobRequest
{
    public string        Title           { get; set; } = string.Empty;
    public string        Description     { get; set; } = string.Empty;
    public string?       Location        { get; set; }
    public string        JobType         { get; set; } = string.Empty;
    public string?       ExperienceLevel { get; set; }
    public int?          SalaryMin       { get; set; }
    public int?          SalaryMax       { get; set; }
    public List<JobSkillRequest> Skills  { get; set; } = [];
}