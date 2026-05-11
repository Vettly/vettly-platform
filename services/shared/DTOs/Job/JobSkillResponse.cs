namespace Vettly.Shared.DTOs.Job;

public class JobSkillResponse
{
    public Guid   Id         { get; set; }
    public string Name       { get; set; } = string.Empty;
    public bool   IsRequired { get; set; }
}