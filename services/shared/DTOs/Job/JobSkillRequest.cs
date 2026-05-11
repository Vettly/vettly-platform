namespace Vettly.Shared.DTOs.Job;

public class JobSkillRequest
{
    public string Name       { get; set; } = string.Empty;
    public bool   IsRequired { get; set; } = true;
}
