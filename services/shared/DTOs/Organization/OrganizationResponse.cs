namespace Vettly.Shared.DTOs.Organization;

public class OrganizationResponse
{
    public Guid     Id          { get; set; }
    public string   Name        { get; set; } = string.Empty;
    public string?  Industry    { get; set; }
    public string?  LogoUrl     { get; set; }
    public string?  Description { get; set; }
    public string?  Website     { get; set; }
    public string?  CompanySize { get; set; }
    public string?  Location    { get; set; }
    public string?  LinkedInUrl { get; set; }
    public string?  TwitterUrl  { get; set; }
    public DateTime CreatedAt   { get; set; }

    public List<OrganizationMemberResponse> Members { get; set; } = [];
}
