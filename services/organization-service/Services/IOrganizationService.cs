using Vettly.Shared.DTOs.Organization;

namespace Vettly.OrganizationService.Services;

public interface IOrganizationService
{
    Task<OrganizationResponse>  CreateAsync(Guid recruiterId, CreateOrganizationRequest req);
    Task<OrganizationResponse?> GetByRecruiterAsync(Guid recruiterId);
    Task<OrganizationResponse?> GetByIdAsync(Guid orgId);
    Task<OrganizationResponse?> UpdateAsync(Guid recruiterId, UpdateOrganizationRequest req);

    Task<List<OrganizationSearchResultResponse>> SearchAsync(string query, Guid recruiterId);
    Task<(OrganizationResponse? Org, string? Error)> JoinByCodeAsync(Guid recruiterId, string joinCode);
    Task<(OrganizationResponse? Org, string? Error)> RegenerateJoinCodeAsync(Guid recruiterId);
}
