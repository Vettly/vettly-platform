using Microsoft.EntityFrameworkCore;
using Vettly.JobService.Data;
using Vettly.JobService.Models;
using Vettly.Shared.DTOs.Job;

namespace Vettly.JobService.Services;

public interface IPipelineService
{
    Task<PipelineStageResponse>       MoveToStageAsync(Guid recruiterId,
        Guid jobId, UpdatePipelineRequest req);
    Task<List<PipelineStageResponse>> GetPipelineAsync(Guid jobId,
        string? stage);
    Task<PipelineStageResponse?>      GetCandidateStageAsync(Guid jobId,
        Guid applicationId);
}

public class PipelineService : IPipelineService
{
    private readonly JobDbContext _db;

    public PipelineService(JobDbContext db)
    {
        _db = db;
    }

    public async Task<PipelineStageResponse> MoveToStageAsync(
        Guid recruiterId, Guid jobId, UpdatePipelineRequest req)
    {
        // verify recruiter owns this job
        var job = await _db.Jobs
            .FirstOrDefaultAsync(j =>
                j.Id == jobId && j.RecruiterId == recruiterId)
            ?? throw new KeyNotFoundException("Job not found");

        var stage = new PipelineStage
        {
            JobId         = jobId,
            ApplicationId = req.ApplicationId,
            CandidateId   = req.CandidateId,
            Stage         = req.Stage,
            Notes         = req.Notes,
            MovedBy       = recruiterId,
        };

        _db.PipelineStages.Add(stage);
        await _db.SaveChangesAsync();
        return MapStage(stage);
    }

    public async Task<List<PipelineStageResponse>> GetPipelineAsync(
        Guid jobId, string? stage)
    {
        // get latest stage per candidate
        var query = _db.PipelineStages
            .Where(p => p.JobId == jobId)
            .AsQueryable();

        if (!string.IsNullOrEmpty(stage))
            query = query.Where(p => p.Stage == stage);

        // get most recent stage per application
        var stages = await query
            .GroupBy(p => p.ApplicationId)
            .Select(g => g.OrderByDescending(p => p.MovedAt).First())
            .ToListAsync();

        return stages.Select(MapStage).ToList();
    }

    public async Task<PipelineStageResponse?> GetCandidateStageAsync(
        Guid jobId, Guid applicationId)
    {
        var stage = await _db.PipelineStages
            .Where(p =>
                p.JobId         == jobId &&
                p.ApplicationId == applicationId)
            .OrderByDescending(p => p.MovedAt)
            .FirstOrDefaultAsync();

        return stage is null ? null : MapStage(stage);
    }

    private static PipelineStageResponse MapStage(PipelineStage s) => new()
    {
        Id            = s.Id,
        JobId         = s.JobId,
        ApplicationId = s.ApplicationId,
        CandidateId   = s.CandidateId,
        Stage         = s.Stage,
        Notes         = s.Notes,
        MovedBy       = s.MovedBy,
        MovedAt       = s.MovedAt,
    };
}