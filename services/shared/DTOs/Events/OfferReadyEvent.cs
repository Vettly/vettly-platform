namespace Vettly.Shared.DTOs.Events;

// Contract only — no publisher yet; esign-service will publish this once built.
public class OfferReadyEvent
{
    public Guid ApplicationId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public Guid CandidateUserId { get; set; }
}
