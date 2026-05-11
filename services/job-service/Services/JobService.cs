using Microsoft.EntityFrameworkCore;
using Vettly.JobService.Data;
using Vettly.JobService.Models;
using Vettly.Shared.DTOs.Job;

namespace Vettly.JobService.Services;

public interface IJobService
{
    Task<JobResponse>              CreateJobAsync(Guid recruiterId,
        CreateJobRequest req);
    Task<JobResponse?>             GetJobAsync(Guid jobId);
    Task<List<JobSummaryResponse>> GetAllOpenJobsAsync(
        string? search, string? jobType, string? experienceLevel);
    Task<List<JobSummaryResponse>> GetMyJobsAsync(Guid recruiterId);
    Task<JobResponse?>             UpdateJobAsync(Guid recruiterId,
        Guid jobId, UpdateJobRequest req);
    Task<bool>                     UpdateJobStatusAsync(Guid recruiterId,
        Guid jobId, string status);
    Task<bool>                     DeleteJobAsync(Guid recruiterId,
        Guid jobId);
}

public class JobService : IJobService
{
    private readonly JobDbContext _db;

    public JobService(JobDbContext db)
    {
        _db = db;
    }

    public async Task<JobResponse> CreateJobAsync(
        Guid recruiterId, CreateJobRequest req)
    {
        var job = new JobPosting
        {
            RecruiterId     = recruiterId,
            Title           = req.Title,
            Description     = req.Description,
            Location        = req.Location,
            JobType         = req.JobType,
            ExperienceLevel = req.ExperienceLevel,
            SalaryMin       = req.SalaryMin,
            SalaryMax       = req.SalaryMax,
            Status          = "draft",
        };

        foreach (var skill in req.Skills)
        {
            job.Skills.Add(new JobSkill
            {
                Name       = skill.Name,
                IsRequired = skill.IsRequired,
            });
        }

        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();
        return MapToResponse(job);
    }

    public async Task<JobResponse?> GetJobAsync(Guid jobId)
    {
        var job = await _db.Jobs
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j => j.Id == jobId);
        return job is null ? null : MapToResponse(job);
    }

    public async Task<List<JobSummaryResponse>> GetAllOpenJobsAsync(
        string? search, string? jobType, string? experienceLevel)
    {
        var query = _db.Jobs
            .Include(j => j.Skills)
            .Include(j => j.PipelineStages)
            .Where(j => j.Status == "open")
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(j =>
                j.Title.Contains(search) ||
                j.Description.Contains(search));

        if (!string.IsNullOrEmpty(jobType))
            query = query.Where(j => j.JobType == jobType);

        if (!string.IsNullOrEmpty(experienceLevel))
            query = query.Where(j => j.ExperienceLevel == experienceLevel);

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToSummary).ToList();
    }

    public async Task<List<JobSummaryResponse>> GetMyJobsAsync(
        Guid recruiterId)
    {
        var jobs = await _db.Jobs
            .Include(j => j.Skills)
            .Include(j => j.PipelineStages)
            .Where(j => j.RecruiterId == recruiterId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToSummary).ToList();
    }

    public async Task<JobResponse?> UpdateJobAsync(
        Guid recruiterId, Guid jobId, UpdateJobRequest req)
    {
        var job = await _db.Jobs
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j =>
                j.Id == jobId && j.RecruiterId == recruiterId);

        if (job is null) return null;

        job.Title           = req.Title           ?? job.Title;
        job.Description     = req.Description     ?? job.Description;
        job.Location        = req.Location        ?? job.Location;
        job.JobType         = req.JobType         ?? job.JobType;
        job.ExperienceLevel = req.ExperienceLevel ?? job.ExperienceLevel;
        job.SalaryMin       = req.SalaryMin       ?? job.SalaryMin;
        job.SalaryMax       = req.SalaryMax       ?? job.SalaryMax;
        job.UpdatedAt       = DateTime.UtcNow;

        // update skills if provided
        if (req.Skills is not null)
        {
            _db.JobSkills.RemoveRange(job.Skills);
            foreach (var skill in req.Skills)
            {
                job.Skills.Add(new JobSkill
                {
                    JobId      = job.Id,
                    Name       = skill.Name,
                    IsRequired = skill.IsRequired,
                });
            }
        }

        await _db.SaveChangesAsync();
        return MapToResponse(job);
    }

    public async Task<bool> UpdateJobStatusAsync(
        Guid recruiterId, Guid jobId, string status)
    {
        var validStatuses = new[]
            { "draft", "open", "closed", "archived" };
        if (!validStatuses.Contains(status))
            return false;

        var job = await _db.Jobs
            .FirstOrDefaultAsync(j =>
                j.Id == jobId && j.RecruiterId == recruiterId);

        if (job is null) return false;

        job.Status    = status;
        job.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteJobAsync(Guid recruiterId, Guid jobId)
    {
        var job = await _db.Jobs
            .FirstOrDefaultAsync(j =>
                j.Id == jobId && j.RecruiterId == recruiterId);

        if (job is null) return false;

        _db.Jobs.Remove(job);
        await _db.SaveChangesAsync();
        return true;
    }

    // ── MAPPERS ───────────────────────────────────
    private static JobResponse MapToResponse(JobPosting j) => new()
    {
        Id              = j.Id,
        RecruiterId     = j.RecruiterId,
        Title           = j.Title,
        Description     = j.Description,
        Location        = j.Location,
        JobType         = j.JobType,
        ExperienceLevel = j.ExperienceLevel,
        SalaryMin       = j.SalaryMin,
        SalaryMax       = j.SalaryMax,
        Status          = j.Status,
        CreatedAt       = j.CreatedAt,
        UpdatedAt       = j.UpdatedAt,
        Skills          = j.Skills.Select(s => new JobSkillResponse
        {
            Id         = s.Id,
            Name       = s.Name,
            IsRequired = s.IsRequired,
        }).ToList(),
    };

    private static JobSummaryResponse MapToSummary(JobPosting j) => new()
    {
        Id              = j.Id,
        Title           = j.Title,
        Location        = j.Location,
        JobType         = j.JobType,
        ExperienceLevel = j.ExperienceLevel,
        SalaryMin       = j.SalaryMin,
        SalaryMax       = j.SalaryMax,
        Status          = j.Status,
        ApplicantCount  = j.PipelineStages
            .Select(p => p.CandidateId)
            .Distinct()
            .Count(),
        CreatedAt       = j.CreatedAt,
        Skills          = j.Skills.Select(s => new JobSkillResponse
        {
            Id         = s.Id,
            Name       = s.Name,
            IsRequired = s.IsRequired,
        }).ToList(),
    };
}