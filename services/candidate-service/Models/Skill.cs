namespace Vettly.CandidateService.Models
{
    public class Skill
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProfileId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Level { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public CandidateProfile Profile { get; set; } = null!;
    }
}
