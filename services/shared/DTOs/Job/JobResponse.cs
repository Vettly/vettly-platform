namespace Vettly.Shared.DTOs.Job;

public class JobResponse
{
    public Guid     Id              { get; set; }
    public Guid     RecruiterId     { get; set; }
    public string   Title           { get; set; } = string.Empty;
    public string   Description     { get; set; } = string.Empty;
    public string?  Location        { get; set; }
    public string   JobType         { get; set; } = string.Empty;
    public string?  ExperienceLevel { get; set; }
    public int?     SalaryMin       { get; set; }
    public int?     SalaryMax       { get; set; }
    public string   Status          { get; set; } = string.Empty;
    public int      ApplicantCount  { get; set; }
    public DateTime CreatedAt       { get; set; }
    public DateTime UpdatedAt       { get; set; }

    public string?   WorkArrangement     { get; set; }
    public string?   Benefits            { get; set; }
    public DateTime? ApplicationDeadline { get; set; }

    public Guid?                  OrganizationId { get; set; }
    public string?                CompanyName    { get; set; }
    public List<JobSkillResponse> Skills         { get; set; } = [];
}