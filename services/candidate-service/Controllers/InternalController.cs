using Microsoft.AspNetCore.Mvc;
using Vettly.CandidateService.DTOs;
using Vettly.CandidateService.Services;

namespace Vettly.CandidateService.Controllers;

[ApiController]
[Route("api/internal/applications")]
public class InternalController(IApplicationService applicationService) : ControllerBase
{
    [HttpPatch("{id}/screening-result")]
    public async Task<IActionResult> UpdateScreeningResult(
        Guid id, [FromBody] ScreeningResultRequest req)
    {
        await applicationService.UpdateScreeningResultAsync(id, req);
        return NoContent();
    }
}
