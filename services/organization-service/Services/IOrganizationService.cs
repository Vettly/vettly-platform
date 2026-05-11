using Vettly.Shared.DTOs.Organization;

namespace Vettly.OrganizationService.Services;

public interface IOrganizationService
{
    Task<OrganizationResponse>  CreateAsync(Guid recruiterId, CreateOrganizationRequest req);
    Task<OrganizationResponse?> GetByRecruiterAsync(Guid recruiterId);
    Task<OrganizationResponse?> GetByIdAsync(Guid orgId);
}
