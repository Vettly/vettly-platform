namespace Vettly.ESignService.Models;

public class Signature
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DocumentId { get; set; }
    public Guid SignedByUserId { get; set; }
    public string SignatureName { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime SignedAt { get; set; } = DateTime.UtcNow;

    public Document Document { get; set; } = null!;
}
