namespace Vettly.Shared.DTOs.Organization;

public class OrganizationMemberResponse
{
    public Guid     RecruiterId { get; set; }
    public string   Role        { get; set; } = string.Empty;
    public DateTime JoinedAt    { get; set; }
}
