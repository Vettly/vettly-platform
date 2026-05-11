namespace Vettly.CandidateService.Models
{
    public class Education
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProfileID { get; set;  }

        public string Institution { get; set; } = string.Empty;

        public string Degree { get; set; } = string.Empty;

        public string Field { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public decimal? Gpa { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public CandidateProfile Profile { get; set; } = null!;
    }
}
