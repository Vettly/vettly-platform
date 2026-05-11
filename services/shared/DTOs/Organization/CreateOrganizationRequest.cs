namespace Vettly.Shared.DTOs.Organization;

public class CreateOrganizationRequest
{
    public string  Name        { get; set; } = string.Empty;
    public string? Industry    { get; set; }
    public string? Description { get; set; }
    public string? Website     { get; set; }
}
