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
            var result = await _applicationService.ApplyAsync(userId, req);
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
    }
}