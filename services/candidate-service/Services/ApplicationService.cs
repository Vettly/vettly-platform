using Microsoft.EntityFrameworkCore;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.Models;
using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly CandidateDbContext _db;
        private readonly JobClient _jobClient;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(CandidateDbContext db, JobClient jobClient,
            ILogger<ApplicationService> logger)
        {
            _db = db;
            _jobClient = jobClient;
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

            return MapApplication(application);
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
