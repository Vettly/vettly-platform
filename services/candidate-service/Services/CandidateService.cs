using Microsoft.EntityFrameworkCore;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.Models;
using Vettly.Shared.DTOs.Candidate;

namespace Vettly.CandidateService.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly CandidateDbContext _db;
        private readonly IS3Service _s3;

        public CandidateService(CandidateDbContext db, IS3Service s3)
        {
            _db = db;
            _s3 = s3;
        }

       
        public async Task<ProfileResponse?> GetProfileAsync(Guid userId)
        {
            var profile = await _db.Profiles
                .Include(profile => profile.Experiences)
                .Include(profile => profile.Educations)
                .Include(profile => profile.Skills)
                .Include(profile => profile.Resumes)
                .FirstOrDefaultAsync(profile => profile.UserId == userId);
            return profile is null ? null : MapToResponse(profile);
        }

        public async Task<ProfileResponse> CreateProfileAsync(
            Guid userId, string email,
            string firstName, string lastName,
            CreateProfileRequest req)
        {
            var profile = new CandidateProfile
            {
                UserId = userId,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Headline = req.Headline,
                Bio = req.Bio,
                Phone = req.Phone,
                Location = req.Location,
                LinkedInUrl = req.LinkedInUrl,
                GitHubUrl = req.GitHubUrl,
                PortfolioUrl = req.PortfolioUrl,
            };

            _db.Profiles.Add(profile);
            await _db.SaveChangesAsync();
            return MapToResponse(profile);
        }

        public async Task<ProfileResponse?> UpdateProfileAsync(
            Guid userId, UpdateProfileRequest req)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile is null) return null;

            profile.Headline = req.Headline ?? profile.Headline;
            profile.Bio = req.Bio ?? profile.Bio;
            profile.Phone = req.Phone ?? profile.Phone;
            profile.Location = req.Location ?? profile.Location;
            profile.LinkedInUrl = req.LinkedInUrl ?? profile.LinkedInUrl;
            profile.GitHubUrl = req.GitHubUrl ?? profile.GitHubUrl;
            profile.PortfolioUrl = req.PortfolioUrl ?? profile.PortfolioUrl;
            profile.AvatarUrl = req.AvatarUrl ?? profile.AvatarUrl;
            profile.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return MapToResponse(profile);
        }

       
        public async Task<ExperienceResponse> AddExperienceAsync(
            Guid userId, ExperienceRequest req)
        {
            var profile = await GetOrThrowAsync(userId);

            var exp = new Experience
            {
                ProfileId = profile.Id,
                Company = req.Company,
                Role = req.Role,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                Description = req.Description,
            };

            _db.Experiences.Add(exp);
            await _db.SaveChangesAsync();
            return MapExperience(exp);
        }

        public async Task<ExperienceResponse?> UpdateExperienceAsync(
            Guid userId, Guid experienceId, ExperienceRequest req)
        {
            var profile = await GetOrThrowAsync(userId);
            var exp = await _db.Experiences
                .FirstOrDefaultAsync(e =>
                    e.Id == experienceId && e.ProfileId == profile.Id);

            if (exp is null) return null;

            exp.Company = req.Company;
            exp.Role = req.Role;
            exp.StartDate = req.StartDate;
            exp.EndDate = req.EndDate;
            exp.Description = req.Description;

            await _db.SaveChangesAsync();
            return MapExperience(exp);
        }

        public async Task<bool> DeleteExperienceAsync(
            Guid userId, Guid experienceId)
        {
            var profile = await GetOrThrowAsync(userId);
            var exp = await _db.Experiences
                .FirstOrDefaultAsync(e =>
                    e.Id == experienceId && e.ProfileId == profile.Id);

            if (exp is null) return false;
            _db.Experiences.Remove(exp);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<ExperienceResponse>> GetExperiencesAsync(Guid userId)
        {
            var profile = await GetOrThrowAsync(userId);
            var experiences = await _db.Experiences
                .Where(experience => experience.ProfileId == profile.Id)
                .OrderByDescending(experience => experience.StartDate)
                .ToListAsync();
            return experiences.Select(MapExperience).ToList();
        }

        public async Task<EducationResponse> AddEducationAsync(
            Guid userId, EducationRequest req)
        {
            var profile = await GetOrThrowAsync(userId);

            var edu = new Education
            {
                ProfileID = profile.Id,
                Institution = req.Institution,
                Degree = req.Degree,
                Field = req.Field,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                Gpa = req.Gpa,
            };

            _db.Educations.Add(edu);
            await _db.SaveChangesAsync();
            return MapEducation(edu);
        }

        public async Task<EducationResponse?> UpdateEducationAsync(
            Guid userId, Guid educationId, EducationRequest req)
        {
            var profile = await GetOrThrowAsync(userId);
            var edu = await _db.Educations
                .FirstOrDefaultAsync(education=>
                    education.Id == educationId && education.ProfileID == profile.Id);

            if (edu is null) return null;

            edu.Institution = req.Institution;
            edu.Degree = req.Degree;
            edu.Field = req.Field;
            edu.StartDate = req.StartDate;
            edu.EndDate = req.EndDate;
            edu.Gpa = req.Gpa;

            await _db.SaveChangesAsync();
            return MapEducation(edu);
        }

        public async Task<bool> DeleteEducationAsync(
            Guid userId, Guid educationId)
        {
            var profile = await GetOrThrowAsync(userId);
            var edu = await _db.Educations
                .FirstOrDefaultAsync(education =>
                    education.Id == educationId && education.ProfileID == profile.Id);

            if (edu is null) return false;
            _db.Educations.Remove(edu);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<EducationResponse>> GetEducationsAsync(Guid userId)
        {
            var profile = await GetOrThrowAsync(userId);
            var educations = await _db.Educations
                .Where(education => education.ProfileID == profile.Id)
                .OrderByDescending(education => education.StartDate)
                .ToListAsync();
            return educations.Select(MapEducation).ToList();
        }

        public async Task<SkillResponse> AddSkillAsync(
            Guid userId, SkillRequest req)
        {
            var profile = await GetOrThrowAsync(userId);

            var skill = new Skill
            {
                ProfileId = profile.Id,
                Name = req.Name,
                Level = req.Level,
            };

            _db.Skills.Add(skill);
            await _db.SaveChangesAsync();
            return MapSkill(skill);
        }

        public async Task<bool> DeleteSkillAsync(Guid userId, Guid skillId)
        {
            var profile = await GetOrThrowAsync(userId);
            var skill = await _db.Skills
                .FirstOrDefaultAsync(s =>
                    s.Id == skillId && s.ProfileId == profile.Id);

            if (skill is null) return false;
            _db.Skills.Remove(skill);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<SkillResponse>> GetSkillsAsync(Guid userId)
        {
            var profile = await GetOrThrowAsync(userId);
            var skills = await _db.Skills
                .Where(skills => skills.ProfileId == profile.Id)
                .OrderBy(skills => skills.Name)
                .ToListAsync();
            return skills.Select(MapSkill).ToList();
        }

        public async Task<ResumeResponse> UploadResumeAsync(
            Guid userId, IFormFile file)
        {
            var profile = await GetOrThrowAsync(userId);

            var (key, url) = await _s3.UploadResumeAsync(file, userId);

            var resume = new Resume
            {
                ProfileId = profile.Id,
                FileName = file.FileName,
                S3Key = key,
                S3Url = url,
                IsPrimary = !await _db.Resumes
                    .AnyAsync(r => r.ProfileId == profile.Id),
            };

            _db.Resumes.Add(resume);
            await _db.SaveChangesAsync();
            return MapResume(resume);
        }

        public async Task<List<ResumeResponse>> GetResumesAsync(Guid userId)
        {
            var profile = await GetOrThrowAsync(userId);
            var resumes = await _db.Resumes
                .Where(r => r.ProfileId == profile.Id)
                .OrderByDescending(r => r.UploadedAt)
                .ToListAsync();
            return resumes.Select(MapResume).ToList();
        }

        public async Task<bool> DeleteResumeAsync(Guid userId, Guid resumeId)
        {
            var profile = await GetOrThrowAsync(userId);
            var resume = await _db.Resumes
                .FirstOrDefaultAsync(r =>
                    r.Id == resumeId && r.ProfileId == profile.Id);

            if (resume is null) return false;

            await _s3.DeleteFileAsync(resume.S3Key);
            _db.Resumes.Remove(resume);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetPrimaryResumeAsync(Guid userId, Guid resumeId)
        {
            var profile = await GetOrThrowAsync(userId);
            var resumes = await _db.Resumes
                .Where(r => r.ProfileId == profile.Id)
                .ToListAsync();

            var target = resumes.FirstOrDefault(r => r.Id == resumeId);
            if (target is null) return false;

            foreach (var r in resumes) r.IsPrimary = r.Id == resumeId;
            await _db.SaveChangesAsync();
            return true;
        }

       
        private async Task<CandidateProfile> GetOrThrowAsync(Guid userId)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile is null)
                throw new KeyNotFoundException("Candidate profile not found");
            return profile;
        }

        private static ProfileResponse MapToResponse(CandidateProfile profile) => new()
        {
            Id = profile.Id,
            UserId = profile.UserId,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            Email = profile.Email,
            Headline = profile.Headline,
            Bio = profile.Bio,
            Phone = profile.Phone,
            Location = profile.Location,
            LinkedInUrl = profile.LinkedInUrl,
            GitHubUrl = profile.GitHubUrl,
            PortfolioUrl = profile.PortfolioUrl,
            AvatarUrl = profile.AvatarUrl,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt,
            Experiences = profile.Experiences.Select(MapExperience).ToList(),
            Educations = profile.Educations.Select(MapEducation).ToList(),
            Skills = profile.Skills.Select(MapSkill).ToList(),
            Resumes = profile.Resumes.Select(MapResume).ToList(),
        };

        private static ExperienceResponse MapExperience(Experience experience) => new()
        {
            Id = experience.Id,
            Company = experience.Company,
            Role = experience.Role,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            Description = experience.Description,
            CreatedAt = experience.CreatedAt,
        };

        private static EducationResponse MapEducation(Education education) => new()
        {
            Id = education.Id,
            Institution = education.Institution,
            Degree = education.Degree,
            Field = education.Field,
            StartDate = education.StartDate,
            EndDate = education.EndDate,
            Gpa = education.Gpa,
            CreatedAt = education.CreatedAt,
        };

        private static SkillResponse MapSkill(Skill skill) => new()
        {
            Id = skill.Id,
            Name = skill.Name,
            Level = skill.Level,
            CreatedAt = skill.CreatedAt,
        };

        private static ResumeResponse MapResume(Resume resume) => new()
        {
            Id = resume.Id,
            FileName = resume.FileName,
            S3Url = resume.S3Url,
            IsPrimary = resume.IsPrimary,
            UploadedAt = resume.UploadedAt,
        };
        public async Task<string?> UploadAvatarAsync(Guid userId, IFormFile file)
        {
            var profile = await _db.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile is null) return null;

            var (_, url) = await _s3.UploadAvatarAsync(file, userId);

            profile.AvatarUrl = url;
            profile.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return url;
        }
    }
}
