namespace Vettly.Shared.DTOs.Organization;

public class CreateOrganizationRequest
{
    public string  Name        { get; set; } = string.Empty;
    public string? Industry    { get; set; }
    public string? Description { get; set; }
    public string? Website     { get; set; }
    public string? CompanySize { get; set; }
    public string? Location    { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? TwitterUrl  { get; set; }
}
