namespace Vettly.Shared.DTOs.Organization;

public class OrganizationSearchResultResponse
{
    public Guid    Id          { get; set; }
    public string  Name        { get; set; } = string.Empty;
    public string? Industry    { get; set; }
    public string? LogoUrl     { get; set; }
    public string? Location    { get; set; }
    public string? CompanySize { get; set; }
    public int     MemberCount { get; set; }
}
