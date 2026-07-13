using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.InterviewService.Services;
using Vettly.Shared.DTOs.Interview;
using Vettly.Shared.Middleware;

namespace Vettly.InterviewService.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewController(IInterviewService interviewService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInterviewRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId    = User.GetUserID();
        var recruiterEmail = User.GetEmail();

        var bearerToken = HttpContext.Request.Headers.Authorization
            .ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

        try
        {
            var result = await interviewService.CreateAsync(
                recruiterId, recruiterEmail, bearerToken, req);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var callerId = User.GetUserID();
        var role     = User.GetRole();
        var result   = await interviewService.GetForCallerAsync(callerId, role);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var callerId = User.GetUserID();
        var role     = User.GetRole();
        var result   = await interviewService.GetByIdAsync(id, callerId, role);
        if (result is null) return NotFound(new { message = "Interview not found" });
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserID();
        var cancelled   = await interviewService.CancelAsync(id, recruiterId);
        if (!cancelled) return NotFound(new { message = "Interview not found" });
        return Ok(new { message = "Interview cancelled" });
    }
}
