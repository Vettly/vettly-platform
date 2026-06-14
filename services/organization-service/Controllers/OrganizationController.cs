using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.OrganizationService.Middleware;
using Vettly.OrganizationService.Services;
using Vettly.Shared.DTOs.Organization;

namespace Vettly.OrganizationService.Controllers;

[ApiController]
[Route("api/organizations")]
[Authorize]
public class OrganizationController(IOrganizationService organizationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrganization(
        [FromBody] CreateOrganizationRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();

        var existing = await organizationService.GetByRecruiterAsync(recruiterId);
        if (existing is not null)
            return Conflict(new { message = "You already belong to an organization" });

        var org = await organizationService.CreateAsync(recruiterId, req);
        return CreatedAtAction(nameof(GetMyOrganization), org);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyOrganization()
    {
        var recruiterId = User.GetUserId();
        var org = await organizationService.GetByRecruiterAsync(recruiterId);
        if (org is null) return NotFound(new { message = "No organization found" });
        return Ok(org);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOrganization(Guid id)
    {
        var org = await organizationService.GetByIdAsync(id);
        if (org is null) return NotFound(new { message = "Organization not found" });
        return Ok(org);
    }

    [HttpPut("mine")]
    public async Task<IActionResult> UpdateMyOrganization(
        [FromBody] UpdateOrganizationRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var org = await organizationService.UpdateAsync(recruiterId, req);
        if (org is null) return NotFound(new { message = "No organization found" });
        return Ok(org);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchOrganizations([FromQuery] string q)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<OrganizationSearchResultResponse>());

        var results = await organizationService.SearchAsync(q, User.GetUserId());
        return Ok(results);
    }

    [HttpPost("join")]
    public async Task<IActionResult> JoinByCode([FromBody] JoinByCodeRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var (org, error) = await organizationService.JoinByCodeAsync(User.GetUserId(), req.JoinCode);
        return error switch
        {
            "already_member" => Conflict(new { message = "You already belong to an organization" }),
            "not_found"       => NotFound(new { message = "Invalid join code" }),
            _                 => Ok(org),
        };
    }

    [HttpPost("mine/join-code/regenerate")]
    public async Task<IActionResult> RegenerateJoinCode()
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var (org, error) = await organizationService.RegenerateJoinCodeAsync(User.GetUserId());
        return error switch
        {
            "not_owner" => Forbid(),
            _           => Ok(org),
        };
    }
}
