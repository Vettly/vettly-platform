namespace Vettly.ESignService.Models;

public static class DocumentStatus
{
    public const string Pending = "pending";
    public const string Signed = "signed";
}

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public Guid RecruiterUserId { get; set; }
    public Guid CandidateUserId { get; set; }

    public string DocumentType { get; set; } = "offer_letter";
    public string JobTitle { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string RecruiterName { get; set; } = string.Empty;

    public int SalaryAmount { get; set; }
    public DateOnly StartDate { get; set; }

    public string S3Key { get; set; } = string.Empty;
    public string? SignedS3Key { get; set; }
    public string Status { get; set; } = DocumentStatus.Pending;
    public string Hash { get; set; } = string.Empty;

    public DateOnly? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SignedAt { get; set; }

    public Signature? Signature { get; set; }
    public ICollection<AuditTrailEntry> AuditTrail { get; set; } = [];
}
