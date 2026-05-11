using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.JobService.Middleware;
using Vettly.JobService.Services;
using Vettly.Shared.DTOs.Job;

namespace Vettly.JobService.Controllers;

[ApiController]
[Route("api/jobs/{jobId}/pipeline")]
[Authorize]
public class PipelineController : ControllerBase
{
    private readonly IPipelineService _pipelineService;

    public PipelineController(IPipelineService pipelineService)
    {
        _pipelineService = pipelineService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPipeline(
        Guid jobId, [FromQuery] string? stage)
    {
        var pipeline = await _pipelineService
            .GetPipelineAsync(jobId, stage);
        return Ok(pipeline);
    }

    [HttpPost("move")]
    public async Task<IActionResult> MoveToStage(
        Guid jobId, [FromBody] UpdatePipelineRequest req)
    {
        if (User.GetRole() != "recruiter")
            return Forbid();

        var recruiterId = User.GetUserId();
        var result      = await _pipelineService
            .MoveToStageAsync(recruiterId, jobId, req);
        return Ok(result);
    }

    [HttpGet("application/{applicationId}")]
    public async Task<IActionResult> GetCandidateStage(
        Guid jobId, Guid applicationId)
    {
        var stage = await _pipelineService
            .GetCandidateStageAsync(jobId, applicationId);
        if (stage is null) return NotFound();
        return Ok(stage);
    }
}