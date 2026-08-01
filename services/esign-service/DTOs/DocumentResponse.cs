namespace Vettly.ESignService.DTOs;

public class DocumentResponse
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string RecruiterName { get; set; } = string.Empty;
    public int SalaryAmount { get; set; }
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? SignedByName { get; set; }
}
