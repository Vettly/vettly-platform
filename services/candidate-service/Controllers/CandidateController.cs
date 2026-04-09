using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vettly.CandidateService.Services;
using Vettly.Shared.DTOs.Candidate;
using Vettly.Shared.Middleware;

namespace Vettly.CandidateService.Controllers
{
    [ApiController]
    [Route("api/candidates")]
    [Authorize]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _candidateService;

        public CandidateController(ICandidateService candidateService)
        {
            _candidateService = candidateService;
        }

       
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.GetUserID();
            var profile = await _candidateService.GetProfileAsync(userId);
            if (profile is null) return NotFound(new { message = "Profile not found" });
            return Ok(profile);
        }
        [HttpPost("profile/avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            // only allow images
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Only JPEG, PNG or WebP allowed" });

            // max 2MB for avatar
            if (file.Length > 2 * 1024 * 1024)
                return BadRequest(new { message = "Image must be under 2MB" });

            var userId = User.GetUserID();
            var result = await _candidateService.UploadAvatarAsync(userId, file);
            if (result is null) return NotFound(new { message = "Profile not found" });
            return Ok(new { avatarUrl = result });
        }
        [HttpPost("profile")]
        public async Task<IActionResult> CreateProfile(
            [FromBody] CreateProfileRequest req)
        {
            var userId = User.GetUserID();
            var email = User.GetEmail();
            var firstName = User.GetFirstName();

            // check profile already exists
            var existing = await _candidateService.GetProfileAsync(userId);
            if (existing is not null)
                return Conflict(new { message = "Profile already exists" });

            var profile = await _candidateService.CreateProfileAsync(
                userId, email, firstName, string.Empty, req);
            return CreatedAtAction(nameof(GetProfile), profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateProfileRequest req)
        {
            var userId = User.GetUserID();
            var profile = await _candidateService.UpdateProfileAsync(userId, req);
            if (profile is null) return NotFound(new { message = "Profile not found" });
            return Ok(profile);
        }

       
        [HttpPost("experience")]
        public async Task<IActionResult> AddExperience(
            [FromBody] ExperienceRequest req)
        {
            var userId = User.GetUserID();
            var result = await _candidateService.AddExperienceAsync(userId, req);
            return Ok(result);
        }

        [HttpPut("experience/{id}")]
        public async Task<IActionResult> UpdateExperience(
            Guid id, [FromBody] ExperienceRequest req)
        {
            var userId = User.GetUserID();
            var result = await _candidateService
                .UpdateExperienceAsync(userId, id, req);
            if (result is null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("experience/{id}")]
        public async Task<IActionResult> DeleteExperience(Guid id)
        {
            var userId = User.GetUserID();
            var deleted = await _candidateService
                .DeleteExperienceAsync(userId, id);
            if (!deleted) return NotFound();
            return NoContent();
        }

       
        [HttpPost("education")]
        public async Task<IActionResult> AddEducation(
            [FromBody] EducationRequest req)
        {
            var userId = User.GetUserID();
            var result = await _candidateService.AddEducationAsync(userId, req);
            return Ok(result);
        }

        [HttpPut("education/{id}")]
        public async Task<IActionResult> UpdateEducation(
            Guid id, [FromBody] EducationRequest req)
        {
            var userId = User.GetUserID();
            var result = await _candidateService
                .UpdateEducationAsync(userId, id, req);
            if (result is null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("education/{id}")]
        public async Task<IActionResult> DeleteEducation(Guid id)
        {
            var userId = User.GetUserID();
            var deleted = await _candidateService
                .DeleteEducationAsync(userId, id);
            if (!deleted) return NotFound();
            return NoContent();
        }

       
        [HttpPost("skills")]
        public async Task<IActionResult> AddSkill([FromBody] SkillRequest req)
        {
            var userId = User.GetUserID();
            var result = await _candidateService.AddSkillAsync(userId, req);
            return Ok(result);
        }

        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> DeleteSkill(Guid id)
        {
            var userId = User.GetUserID();
            var deleted = await _candidateService.DeleteSkillAsync(userId, id);
            if (!deleted) return NotFound();
            return NoContent();
        }

       
        [HttpPost("resume")]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            if (!file.ContentType.Equals("application/pdf",
                StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Only PDF files allowed" });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File size must be under 5MB" });

            var userId = User.GetUserID();
            var result = await _candidateService.UploadResumeAsync(userId, file);
            return Ok(result);
        }

        [HttpGet("resume")]
        public async Task<IActionResult> GetResumes()
        {
            var userId = User.GetUserID();
            var resumes = await _candidateService.GetResumesAsync(userId);
            return Ok(resumes);
        }

        [HttpDelete("resume/{id}")]
        public async Task<IActionResult> DeleteResume(Guid id)
        {
            var userId = User.GetUserID();
            var deleted = await _candidateService.DeleteResumeAsync(userId, id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPatch("resume/{id}/primary")]
        public async Task<IActionResult> SetPrimaryResume(Guid id)
        {
            var userId = User.GetUserID();
            var result = await _candidateService
                .SetPrimaryResumeAsync(userId, id);
            if (!result) return NotFound();
            return Ok(new { message = "Primary resume updated" });
        }
    }
}
