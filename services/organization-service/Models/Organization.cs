namespace Vettly.OrganizationService.Models;

public class Organization
{
    public Guid     Id          { get; set; } = Guid.NewGuid();
    public string   Name        { get; set; } = string.Empty;
    public string?  Industry    { get; set; }
    public string?  LogoUrl     { get; set; }
    public string?  Description { get; set; }
    public string?  Website     { get; set; }
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;

    public ICollection<OrganizationMember> Members { get; set; } = [];
}
