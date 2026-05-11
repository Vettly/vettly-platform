namespace Vettly.CandidateService.Models
{
    public class Experience
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProfileId { get; set; }

        public string Company { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public CandidateProfile Profile { get; set; } = null!;
    }
}
