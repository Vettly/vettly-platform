using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.DTOs;
using Vettly.CandidateService.Services;

namespace Vettly.CandidateService.Controllers;

[ApiController]
[Route("api/internal/applications")]
public class InternalController(
    IApplicationService applicationService, CandidateDbContext db) : ControllerBase
{
    [HttpPatch("{id}/screening-result")]
    public async Task<IActionResult> UpdateScreeningResult(
        Guid id, [FromBody] ScreeningResultRequest req)
    {
        await applicationService.UpdateScreeningResultAsync(id, req);
        return NoContent();
    }

    [HttpGet("{id}/participants")]
    public async Task<IActionResult> GetParticipants(Guid id)
    {
        var result = await db.Applications
            .Where(a => a.Id == id)
            .Select(a => new
            {
                ApplicationId = a.Id,
                a.JobId,
                CandidateUserId = a.Candidate.UserId,
                a.Candidate.FirstName,
                a.Candidate.LastName,
            })
            .FirstOrDefaultAsync();

        if (result is null) return NotFound();

        return Ok(new
        {
            result.ApplicationId,
            result.JobId,
            result.CandidateUserId,
            CandidateFirstName = result.FirstName,
            CandidateLastName = result.LastName,
        });
    }
}
