namespace Vettly.Shared.DTOs.Job;

public class UpdateJobRequest
{
    public string?       Title           { get; set; }
    public string?       Description     { get; set; }
    public string?       Location        { get; set; }
    public string?       JobType         { get; set; }
    public string?       ExperienceLevel { get; set; }
    public int?          SalaryMin       { get; set; }
    public int?          SalaryMax       { get; set; }
    public string?       WorkArrangement     { get; set; }
    public string?       Benefits            { get; set; }
    public DateTime?     ApplicationDeadline { get; set; }
    public List<JobSkillRequest>? Skills { get; set; }
}