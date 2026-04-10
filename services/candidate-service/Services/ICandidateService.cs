using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public interface ICandidateService
    {
        Task<ProfileResponse?> GetProfileAsync(Guid userId);
        Task<ProfileResponse> CreateProfileAsync(Guid userId, string email,
            string firstName, string lastName, CreateProfileRequest req);
        Task<ProfileResponse?> UpdateProfileAsync(Guid userId,
            UpdateProfileRequest req);

        Task<ExperienceResponse> AddExperienceAsync(Guid userId,
            ExperienceRequest req);
        Task<ExperienceResponse?> UpdateExperienceAsync(Guid userId,
            Guid experienceId, ExperienceRequest req);
        Task<bool> DeleteExperienceAsync(Guid userId,
            Guid experienceId);
        Task<List<ExperienceResponse>> GetExperiencesAsync(Guid userId);

        Task<EducationResponse> AddEducationAsync(Guid userId,
            EducationRequest req);
        Task<EducationResponse?> UpdateEducationAsync(Guid userId,
            Guid educationId, EducationRequest req);
        Task<bool> DeleteEducationAsync(Guid userId,
            Guid educationId);
        Task<List<EducationResponse>> GetEducationsAsync(Guid userId);

        Task<SkillResponse> AddSkillAsync(Guid userId, SkillRequest req);
        Task<bool> DeleteSkillAsync(Guid userId, Guid skillId);
        Task<List<SkillResponse>> GetSkillsAsync(Guid userId);

        Task<ResumeResponse> UploadResumeAsync(Guid userId, IFormFile file);
        Task<List<ResumeResponse>> GetResumesAsync(Guid userId);
        Task<bool> DeleteResumeAsync(Guid userId, Guid resumeId);
        Task<bool> SetPrimaryResumeAsync(Guid userId, Guid resumeId);

        Task<string?> UploadAvatarAsync(Guid userId, IFormFile file);
    }
}
