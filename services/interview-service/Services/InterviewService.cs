using Microsoft.EntityFrameworkCore;
using Vettly.InterviewService.Data;
using Vettly.InterviewService.Models;
using Vettly.Shared.DTOs.Interview;

namespace Vettly.InterviewService.Services;

public class InterviewService(
    InterviewDbContext db,
    CandidateClient candidateClient,
    JobClient jobClient) : IInterviewService
{
    public async Task<InterviewResponse> CreateAsync(
        Guid recruiterId,
        string recruiterEmail,
        string bearerToken,
        CreateInterviewRequest req)
    {
        var candidateInfo = await candidateClient.GetCandidateInfoAsync(bearerToken, req.CandidateId);
        if (candidateInfo is null)
            throw new InvalidOperationException("Could not retrieve candidate information");

        var interview = new Interview
        {
            RecruiterId     = recruiterId,
            RecruiterEmail  = recruiterEmail,
            CandidateId     = req.CandidateId,
            CandidateUserId = candidateInfo.UserId,
            CandidateEmail  = candidateInfo.Email,
            JobId           = req.JobId,
            ApplicationId   = req.ApplicationId,
            Title           = req.Title,
            ScheduledAt     = req.ScheduledAt.ToUniversalTime(),
            DurationMinutes = req.DurationMinutes,
            Notes           = req.Notes,
            MeetingLink     = req.MeetingLink,
        };

        db.Interviews.Add(interview);
        await db.SaveChangesAsync();

        _ = Task.Run(async () =>
        {
            await jobClient.MoveToInterviewStageAsync(
                bearerToken, req.JobId, req.ApplicationId, req.CandidateId);
        });

        return ToResponse(interview);
    }

    public async Task<List<InterviewResponse>> GetForCallerAsync(Guid callerId, string role)
    {
        var query = role == "recruiter"
            ? db.Interviews.Where(i => i.RecruiterId == callerId)
            : db.Interviews.Where(i => i.CandidateUserId == callerId);

        var interviews = await query
            .OrderBy(i => i.ScheduledAt)
            .ToListAsync();

        return interviews.Select(ToResponse).ToList();
    }

    public async Task<InterviewResponse?> GetByIdAsync(Guid id, Guid callerId, string role)
    {
        var interview = await db.Interviews.FindAsync(id);
        if (interview is null) return null;

        var isOwner = role == "recruiter"
            ? interview.RecruiterId == callerId
            : interview.CandidateUserId == callerId;

        return isOwner ? ToResponse(interview) : null;
    }

    public async Task<bool> CancelAsync(Guid id, Guid recruiterId)
    {
        var interview = await db.Interviews.FindAsync(id);
        if (interview is null || interview.RecruiterId != recruiterId) return false;

        interview.Status = "cancelled";
        await db.SaveChangesAsync();

        return true;
    }

    private static InterviewResponse ToResponse(Interview i) => new()
    {
        Id              = i.Id,
        RecruiterId    = i.RecruiterId,
        RecruiterEmail = i.RecruiterEmail,
        CandidateId    = i.CandidateId,
        CandidateEmail = i.CandidateEmail,
        JobId          = i.JobId,
        ApplicationId  = i.ApplicationId,
        Title          = i.Title,
        ScheduledAt    = i.ScheduledAt,
        DurationMinutes = i.DurationMinutes,
        Notes          = i.Notes,
        Status         = i.Status,
        MeetingLink    = i.MeetingLink,
        CreatedAt      = i.CreatedAt,
    };
}
