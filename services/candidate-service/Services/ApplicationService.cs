using Microsoft.EntityFrameworkCore;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.Models;
using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly CandidateDbContext _db;

        public ApplicationService(CandidateDbContext db)
        {
            _db = db;
        }

        public async Task<ApplicationResponse> ApplyAsync(
            Guid userId, CreateApplicationRequest req)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId)
                ?? throw new KeyNotFoundException("Profile not found");

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
            return MapApplication(application);
        }

        public async Task<List<ApplicationResponse>> GetMyApplicationsAsync(
            Guid userId)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId)
                ?? throw new KeyNotFoundException("Profile not found");

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
                .FirstOrDefaultAsync(profile => profile.UserId == userId)
                ?? throw new KeyNotFoundException("Profile not found");

            var application = await _db.Applications
                .FirstOrDefaultAsync(application =>
                    application.Id == applicationId &&
                    application.CandidateId == profile.Id);

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
            AppliedAt = application.AppliedAt,
            UpdatedAt = application.UpdatedAt,
        };
    }
}
