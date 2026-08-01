namespace Vettly.Shared.DTOs.Events;

public class DomainEventEnvelope<T>
{
    public string Type { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public T Data { get; set; } = default!;
}

public static class DomainEventTypes
{
    public const string ApplicationReceived = "application_received";
    public const string StageChanged = "stage_changed";
    public const string OfferReady = "offer_ready";
    public const string DocumentSigned = "document_signed";
}
