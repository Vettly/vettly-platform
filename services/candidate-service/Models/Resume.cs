namespace Vettly.CandidateService.Models
{
    public class Resume
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string S3Key { get; set; } = string.Empty;
        
        public string S3Url { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public CandidateProfile Profile { get; set; } = null!;
    }
}
