namespace Vettly.OrganizationService.Models;

public class OrganizationMember
{
    public Guid     Id             { get; set; } = Guid.NewGuid();
    public Guid     OrganizationId { get; set; }
    public Guid     RecruiterId    { get; set; }
    public string   Role           { get; set; } = "member";
    public DateTime JoinedAt       { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;
}
