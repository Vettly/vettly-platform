namespace Vettly.CandidateService.Models
{
    public class Application
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CandidateId { get; set; }

        public Guid JobId { get; set; }

        public Guid ResumeId { get; set; }

        public string Status { get; set; } = "applied";

        public decimal? AiScore { get; set; }

        public bool BiasFlagged { get; set; } = false;

        public decimal? MathScore { get; set; }

        public string? SkillGap { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt {  get; set; } = DateTime.UtcNow;

        public CandidateProfile Candidate { get; set; } = null!;

        public Resume Resume { get; set; } = null!;
    }
}
