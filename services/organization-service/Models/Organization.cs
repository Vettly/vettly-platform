namespace Vettly.OrganizationService.Models;

public class Organization
{
    public Guid     Id          { get; set; } = Guid.NewGuid();
    public string   Name        { get; set; } = string.Empty;
    public string?  Industry    { get; set; }
    public string?  LogoUrl     { get; set; }
    public string?  Description { get; set; }
    public string?  Website     { get; set; }
    public string?  CompanySize { get; set; }
    public string?  Location    { get; set; }
    public string?  LinkedInUrl { get; set; }
    public string?  TwitterUrl  { get; set; }
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    public string?  JoinCode    { get; set; }

    public ICollection<OrganizationMember> Members { get; set; } = [];
}
