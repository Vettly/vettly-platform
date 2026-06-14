using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.JobService.Middleware;
using Vettly.JobService.Services;
using Vettly.Shared.DTOs.Job;

namespace Vettly.JobService.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobController : ControllerBase
{
    private const string BearerPrefix = "Bearer ";

    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    private string BearerToken =>
        Request.Headers.Authorization.ToString().Replace(BearerPrefix, "");

    // ── PUBLIC ENDPOINTS (candidates can browse) ──

    [HttpGet]
    public async Task<IActionResult> GetOpenJobs(
        [FromQuery] string? search,
        [FromQuery] string? jobType,
        [FromQuery] string? experienceLevel)
    {
        var jobs = await _jobService.GetAllOpenJobsAsync(
            search, jobType, experienceLevel);
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(Guid id)
    {
        var job = await _jobService.GetJobAsync(id);
        if (job is null) return NotFound(new { message = "Job not found" });
        return Ok(job);
    }

    // ── RECRUITER ENDPOINTS ────────────────────────

    [HttpGet("my-jobs")]
    [Authorize]
    public async Task<IActionResult> GetMyJobs()
    {
        var recruiterId = User.GetUserId();
        var bearerToken = BearerToken;
        var jobs        = await _jobService.GetMyJobsAsync(recruiterId, bearerToken);
        return Ok(jobs);
    }

    [HttpGet("my-jobs/stats")]
    [Authorize]
    public async Task<IActionResult> GetMyJobsStats()
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var bearerToken = BearerToken;
        var stats       = await _jobService.GetMyJobsStatsAsync(recruiterId, bearerToken);
        return Ok(stats);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateJob(
        [FromBody] CreateJobRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId  = User.GetUserId();
        var bearerToken  = BearerToken;

        try
        {
            var job = await _jobService.CreateJobAsync(recruiterId, req, bearerToken);
            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateJob(
        Guid id, [FromBody] UpdateJobRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var bearerToken = BearerToken;
        var job         = await _jobService
            .UpdateJobAsync(recruiterId, id, req, bearerToken);

        if (job is null) return NotFound(new { message = "Job not found" });
        return Ok(job);
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateJobStatus(
        Guid id, [FromBody] UpdateJobStatusRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var bearerToken = BearerToken;
        var updated     = await _jobService
            .UpdateJobStatusAsync(recruiterId, id, req.Status, bearerToken);

        if (!updated)
            return BadRequest(new { message = "Invalid status or job not found" });

        return Ok(new { message = "Status updated" });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var bearerToken = BearerToken;
        var deleted     = await _jobService.DeleteJobAsync(recruiterId, id, bearerToken);

        if (!deleted) return NotFound(new { message = "Job not found" });
        return NoContent();
    }
}