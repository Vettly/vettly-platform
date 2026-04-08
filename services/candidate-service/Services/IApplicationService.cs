using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public interface IApplicationService
    {
        Task<ApplicationResponse> ApplyAsync(Guid userId,
        CreateApplicationRequest req);
        Task<List<ApplicationResponse>> GetMyApplicationsAsync(Guid userId);
        Task<ApplicationResponse?> GetApplicationAsync(Guid userId,
            Guid applicationId);
    }
}
