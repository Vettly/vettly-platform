namespace Vettly.ESignService.Models;

public static class AuditAction
{
    public const string Created = "created";
    public const string Viewed = "viewed";
    public const string Signed = "signed";
    public const string Downloaded = "downloaded";
}

public class AuditTrailEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DocumentId { get; set; }
    public string Action { get; set; } = string.Empty;
    public Guid ActorUserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

    public Document Document { get; set; } = null!;
}
