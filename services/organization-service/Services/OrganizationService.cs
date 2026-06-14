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
            JoinCode    = await GenerateJoinCodeAsync(),
        };

        db.Organizations.Add(org);

        db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = org.Id,
            RecruiterId    = recruiterId,
            Role           = "owner",
        });

        await db.SaveChangesAsync();
        return MapToResponse(org, includeJoinCode: true);
    }

    public async Task<OrganizationResponse?> GetByRecruiterAsync(Guid recruiterId)
    {
        var member = await db.OrganizationMembers
            .Include(m => m.Organization)
                .ThenInclude(o => o.Members)
            .Where(m => m.RecruiterId == recruiterId)
            .OrderBy(m => m.JoinedAt)
            .FirstOrDefaultAsync();

        return member is null ? null : MapToResponse(member.Organization, includeJoinCode: true);
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

    public async Task<List<OrganizationSearchResultResponse>> SearchAsync(string query, Guid recruiterId)
    {
        return await db.Organizations
            .Where(o => o.Name.ToLower().Contains(query.ToLower()))
            .OrderBy(o => o.Name)
            .Take(20)
            .Select(o => new OrganizationSearchResultResponse
            {
                Id          = o.Id,
                Name        = o.Name,
                Industry    = o.Industry,
                LogoUrl     = o.LogoUrl,
                Location    = o.Location,
                CompanySize = o.CompanySize,
                MemberCount = o.Members.Count,
            })
            .ToListAsync();
    }

    public async Task<(OrganizationResponse? Org, string? Error)> JoinByCodeAsync(Guid recruiterId, string joinCode)
    {
        var alreadyMember = await db.OrganizationMembers.AnyAsync(m => m.RecruiterId == recruiterId);
        if (alreadyMember) return (null, "already_member");

        var org = await db.Organizations
            .Include(o => o.Members)
            .FirstOrDefaultAsync(o => o.JoinCode != null && o.JoinCode.ToLower() == joinCode.ToLower());

        if (org is null) return (null, "not_found");

        db.OrganizationMembers.Add(new OrganizationMember
        {
            OrganizationId = org.Id,
            RecruiterId    = recruiterId,
            Role           = "member",
        });

        org.JoinCode = await GenerateJoinCodeAsync();

        await db.SaveChangesAsync();
        return (MapToResponse(org, includeJoinCode: false), null);
    }

    public async Task<(OrganizationResponse? Org, string? Error)> RegenerateJoinCodeAsync(Guid recruiterId)
    {
        var ownerMembership = await db.OrganizationMembers
            .Include(m => m.Organization)
                .ThenInclude(o => o.Members)
            .FirstOrDefaultAsync(m => m.RecruiterId == recruiterId && m.Role == "owner");

        if (ownerMembership is null) return (null, "not_owner");

        var org = ownerMembership.Organization;
        org.JoinCode = await GenerateJoinCodeAsync();

        await db.SaveChangesAsync();
        return (MapToResponse(org, includeJoinCode: true), null);
    }

    private async Task<string> GenerateJoinCodeAsync()
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var code = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
            if (!await db.Organizations.AnyAsync(o => o.JoinCode == code))
                return code;
        }

        throw new InvalidOperationException("Failed to generate a unique join code");
    }

    private static OrganizationResponse MapToResponse(Organization org, bool includeJoinCode = false) => new()
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
        JoinCode    = includeJoinCode ? org.JoinCode : null,
        Members     = org.Members.Select(m => new OrganizationMemberResponse
        {
            RecruiterId = m.RecruiterId,
            Role        = m.Role,
            JoinedAt    = m.JoinedAt,
        }).ToList(),
    };
}
