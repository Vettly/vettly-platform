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
}
