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
            CompanySize = req.CompanySize,
            Location    = req.Location,
            LinkedInUrl = req.LinkedInUrl,
            TwitterUrl  = req.TwitterUrl,
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
                .ThenInclude(o => o.Members)
            .Where(m => m.RecruiterId == recruiterId)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        return member is null ? null : MapToResponse(member.Organization);
    }

    public async Task<OrganizationResponse?> GetByIdAsync(Guid orgId)
    {
        var org = await db.Organizations
            .Include(o => o.Members)
            .FirstOrDefaultAsync(o => o.Id == orgId);
        return org is null ? null : MapToResponse(org);
    }

    public async Task<OrganizationResponse?> UpdateAsync(
        Guid recruiterId, UpdateOrganizationRequest req)
    {
        var member = await db.OrganizationMembers
            .Include(m => m.Organization)
                .ThenInclude(o => o.Members)
            .Where(m => m.RecruiterId == recruiterId)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        if (member is null) return null;

        var org = member.Organization;
        org.Name        = req.Name        ?? org.Name;
        org.Industry    = req.Industry    ?? org.Industry;
        org.Description = req.Description ?? org.Description;
        org.Website     = req.Website     ?? org.Website;
        org.CompanySize = req.CompanySize ?? org.CompanySize;
        org.Location    = req.Location    ?? org.Location;
        org.LinkedInUrl = req.LinkedInUrl ?? org.LinkedInUrl;
        org.TwitterUrl  = req.TwitterUrl  ?? org.TwitterUrl;

        await db.SaveChangesAsync();
        return MapToResponse(org);
    }

    private static OrganizationResponse MapToResponse(Organization org) => new()
    {
        Id          = org.Id,
        Name        = org.Name,
        Industry    = org.Industry,
        LogoUrl     = org.LogoUrl,
        Description = org.Description,
        Website     = org.Website,
        CompanySize = org.CompanySize,
        Location    = org.Location,
        LinkedInUrl = org.LinkedInUrl,
        TwitterUrl  = org.TwitterUrl,
        CreatedAt   = org.CreatedAt,
        Members     = org.Members.Select(m => new OrganizationMemberResponse
        {
            RecruiterId = m.RecruiterId,
            Role        = m.Role,
            JoinedAt    = m.JoinedAt,
        }).ToList(),
    };
}
