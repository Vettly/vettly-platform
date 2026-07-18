using Vettly.CandidateService.DTOs;
using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public interface IApplicationService
    {
        Task<ApplicationResponse?> ApplyAsync(Guid userId,
        CreateApplicationRequest req, string bearerToken);
        Task<List<ApplicationResponse>> GetMyApplicationsAsync(Guid userId);
        Task<ApplicationResponse?> GetApplicationAsync(Guid userId,
            Guid applicationId);
        Task<ApplicationResponse?> GetApplicationByIdAsync(Guid applicationId);
        Task UpdateScreeningResultAsync(Guid applicationId, ScreeningResultRequest req);
        Task<List<JobPreviewScore>> GetPreviewScoresAsync(Guid userId, List<JobPreviewInfo> jobs);
    }
}
