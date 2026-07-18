using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.DTOs;
using Vettly.CandidateService.Models;
using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly CandidateDbContext _db;
        private readonly JobClient _jobClient;
        private readonly ScreeningClient _screeningClient;
        private readonly IMemoryCache _cache;
        private readonly string _selfUrl;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(
            CandidateDbContext db,
            JobClient jobClient,
            ScreeningClient screeningClient,
            IMemoryCache cache,
            IConfiguration configuration,
            ILogger<ApplicationService> logger)
        {
            _db = db;
            _jobClient = jobClient;
            _screeningClient = screeningClient;
            _cache = cache;
            _selfUrl = configuration["CandidateService:SelfUrl"]
                ?? "http://vettly-candidate:8080";
            _logger = logger;
        }

        public async Task<ApplicationResponse?> ApplyAsync(
            Guid userId, CreateApplicationRequest req, string bearerToken)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId);
            if (profile is null) return null;

            // check not already applied
            var existing = await _db.Applications
                .AnyAsync(a =>
                    a.CandidateId == profile.Id &&
                    a.JobId == req.JobId);

            if (existing)
                throw new InvalidOperationException(
                    "Already applied to this job");

            var resume = await _db.Resumes
                .FirstOrDefaultAsync(r => r.Id == req.ResumeId && r.ProfileId == profile.Id);

            var application = new Application
            {
                CandidateId = profile.Id,
                JobId = req.JobId,
                ResumeId = req.ResumeId,
                Status = "applied",
            };

            _db.Applications.Add(application);
            await _db.SaveChangesAsync();

            try
            {
                await _jobClient.RegisterApplicationAsync(
                    bearerToken, req.JobId, application.Id, profile.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to register application {ApplicationId} on job-service pipeline for job {JobId}",
                    application.Id, req.JobId);
            }

            if (resume is not null)
            {
                try
                {
                    var callbackUrl =
                        $"{_selfUrl}/api/internal/applications/{application.Id}/screening-result";
                    await _screeningClient.RequestScreeningAsync(
                        application.Id.ToString(),
                        resume.S3Key,
                        req.JobId.ToString(),
                        $"{profile.FirstName} {profile.LastName}",
                        callbackUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Screening request failed for application {ApplicationId} — scores will remain null",
                        application.Id);
                }
            }

            return MapApplication(application);
        }

        public async Task UpdateScreeningResultAsync(Guid applicationId, ScreeningResultRequest req)
        {
            var app = await _db.Applications.FindAsync(applicationId);
            if (app is null) return;

            app.AiScore     = (decimal)req.AiScore;
            app.MathScore   = (decimal)req.MatchScore;
            app.BiasFlagged = req.BiasFlagged;
            app.SkillGap    = JsonSerializer.Serialize(req.SkillGap);
            app.UpdatedAt   = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        public async Task<List<ApplicationResponse>> GetMyApplicationsAsync(
            Guid userId)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId);
            if (profile is null) return [];

            var applications = await _db.Applications
                .Where(application => application.CandidateId == profile.Id)
                .OrderByDescending(application => application.AppliedAt)
                .ToListAsync();

            return applications.Select(MapApplication).ToList();
        }

        public async Task<ApplicationResponse?> GetApplicationAsync(
            Guid userId, Guid applicationId)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId);
            if (profile is null) return null;

            var application = await _db.Applications
                .FirstOrDefaultAsync(application =>
                    application.Id == applicationId &&
                    application.CandidateId == profile.Id);

            return application is null ? null : MapApplication(application);
        }

        public async Task<ApplicationResponse?> GetApplicationByIdAsync(Guid applicationId)
        {
            var application = await _db.Applications
                .FirstOrDefaultAsync(application => application.Id == applicationId);

            return application is null ? null : MapApplication(application);
        }

        public async Task<List<JobPreviewScore>> GetPreviewScoresAsync(
            Guid userId, List<JobPreviewInfo> jobs)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile is null) return [];

            var resume = await _db.Resumes
                .FirstOrDefaultAsync(r => r.ProfileId == profile.Id && r.IsPrimary)
                ?? await _db.Resumes
                    .Where(r => r.ProfileId == profile.Id)
                    .OrderByDescending(r => r.UploadedAt)
                    .FirstOrDefaultAsync();

            if (resume is null) return [];

            var jobsSignature = string.Join(",", jobs.Select(j => j.Id).Order());
            var cacheKey = $"preview:{userId}:{resume.Id}:{jobsSignature}";
            if (_cache.TryGetValue(cacheKey, out List<JobPreviewScore>? cached))
                return cached!;

            var scores = await _screeningClient.GetBatchPreviewAsync(resume.S3Key, jobs);
            _cache.Set(cacheKey, scores, TimeSpan.FromMinutes(30));
            return scores;
        }

        private static ApplicationResponse MapApplication(Application application) => new()
        {
            Id = application.Id,
            JobId = application.JobId,
            ResumeId = application.ResumeId,
            Status = application.Status,
            AiScore = application.AiScore,
            BiasFlagged = application.BiasFlagged,
            MatchScore = application.MathScore,
            SkillGap = application.SkillGap,
            AppliedAt = application.AppliedAt,
            UpdatedAt = application.UpdatedAt,
        };
    }
}
