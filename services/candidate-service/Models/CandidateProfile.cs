namespace Vettly.CandidateService.Models
{
    public class CandidateProfile
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Headline { get; set; }

        public string? Bio { get; set; }

        public string? Phone { get; set; }

        public string? Location { get; set; }

        public string? LinkedInUrl { get; set; }

        public string? GitHubUrl { get; set; }

        public string? PortfolioUrl { get; set; }

        public string? AvatarUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Experience> Experiences { get; set; } = [];

        public ICollection<Education> Educations { get; set; } = [];

        public ICollection<Skill> Skills { get; set; } = [];

        public ICollection<Resume> Resumes { get; set; } = [];

        public ICollection<Application> Applications { get; set; } = [];

    }
}
