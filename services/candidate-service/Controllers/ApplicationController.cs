using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vettly.CandidateService.Services;
using Vettly.Shared.DTOs.Candidate;
using Vettly.Shared.Middleware;

namespace Vettly.CandidateService.Controllers
{
    [ApiController]
    [Route("api/candidates/applications")]
    [Authorize]
    public class ApplicationController : ControllerBase
    {
        private readonly IApplicationService _applicationService;

        public ApplicationController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpPost]
        public async Task<IActionResult> Apply(
            [FromBody] CreateApplicationRequest req)
        {
            var userId = User.GetUserID();
            var bearerToken = Request.Headers.Authorization
                .ToString().Replace("Bearer ", string.Empty);
            var result = await _applicationService.ApplyAsync(userId, req, bearerToken);
            if (result is null) return NotFound(new { message = "Profile not found" });
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyApplications()
        {
            var userId = User.GetUserID();
            var applications = await _applicationService
                .GetMyApplicationsAsync(userId);
            return Ok(applications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplication(Guid id)
        {
            var userId = User.GetUserID();
            var application = await _applicationService
                .GetApplicationAsync(userId, id);
            if (application is null) return NotFound();
            return Ok(application);
        }

        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetApplicationSummary(Guid id)
        {
            var application = await _applicationService.GetApplicationByIdAsync(id);
            if (application is null) return NotFound();
            return Ok(application);
        }

        [HttpPost("preview-scores")]
        public async Task<IActionResult> GetPreviewScores([FromBody] List<JobPreviewInfo> jobs)
        {
            if (jobs is null || jobs.Count == 0) return Ok(Array.Empty<object>());
            var userId = User.GetUserID();
            var scores = await _applicationService.GetPreviewScoresAsync(userId, jobs);
            return Ok(scores);
        }
    }
}