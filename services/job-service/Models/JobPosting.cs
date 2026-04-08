namespace Vettly.JobServce.Models;


public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public  Guid RecruiterId { get; set; } // from auth.users
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public String JobType { get; set; } = string.Empty; 
    // Full-time | Part-time | Contract | remote
    public string? ExperienceLevel { get; set; }
    //junior  | mid | senior
    public int? SalaryMin { get; set; }
    public int? SalaryMax { get; set; }
    public string Status { get; set; } = "draft"; 
    // draft | Open | Closed | archived
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobSkill> Skills { get; set; } = [];
    public ICollection<PipelineStage> PipelineStages { get; set; } = [];

}