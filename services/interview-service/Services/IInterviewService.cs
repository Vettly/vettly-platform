using Vettly.Shared.DTOs.Interview;

namespace Vettly.InterviewService.Services;

public interface IInterviewService
{
    Task<InterviewResponse>       CreateAsync(Guid recruiterId, string recruiterEmail, string bearerToken, CreateInterviewRequest req);
    Task<List<InterviewResponse>> GetForCallerAsync(Guid callerId, string role);
    Task<InterviewResponse?>      GetByIdAsync(Guid id, Guid callerId, string role);
    Task<bool>                    CancelAsync(Guid id, Guid recruiterId);
}
