using Microsoft.EntityFrameworkCore;
using Vettly.OrganizationService.Data;
using Vettly.OrganizationService.Models;
using Vettly.Shared.DTOs.Organization;

namespace Vettly.OrganizationService.Services;

public class OrganizationService(OrganizationDbContext db) : IOrganizationService
{
    public async Task<OrganizationResponse> CreateAsync(
        Guid recruiterId, CreateOrganizationRequest req)
    {
        var org = new Organization
        {
            Name        = req.Name,
            Industry    = req.Industry,
            Description = req.Description,
            Website     = req.Website,
        };

        db.Organizations.Add(org);

        db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = org.Id,
            RecruiterId    = recruiterId,
            Role           = "owner",
        });

        await db.SaveChangesAsync();
        return MapToResponse(org);
    }

    public async Task<OrganizationResponse?> GetByRecruiterAsync(Guid recruiterId)
    {
        var member = await db.OrganizationMembers
            .Include(m => m.Organization)
            .Where(m => m.RecruiterId == recruiterId)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        return member is null ? null : MapToResponse(member.Organization);
    }

    public async Task<OrganizationResponse?> GetByIdAsync(Guid orgId)
    {
        var org = await db.Organizations.FindAsync(orgId);
        return org is null ? null : MapToResponse(org);
    }

    private static OrganizationResponse MapToResponse(Organization org) => new()
    {
        Id          = org.Id,
        Name        = org.Name,
        Industry    = org.Industry,
        LogoUrl     = org.LogoUrl,
        Description = org.Description,
        Website     = org.Website,
        CreatedAt   = org.CreatedAt,
    };
}
