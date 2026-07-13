using System.ComponentModel.DataAnnotations;

namespace Vettly.Shared.DTOs.Interview;

public class CreateInterviewRequest
{
    public Guid     CandidateId     { get; set; }
    public Guid     JobId           { get; set; }
    public Guid     ApplicationId   { get; set; }
    public string   Title           { get; set; } = string.Empty;
    public DateTime ScheduledAt     { get; set; }
    public int      DurationMinutes { get; set; } = 60;
    public string?  Notes           { get; set; }

    [Required]
    [Url]
    public string   MeetingLink     { get; set; } = string.Empty;
}
