namespace Vettly.Shared.DTOs.Interview;

public class InterviewResponse
{
    public Guid     Id              { get; set; }
    public Guid     RecruiterId    { get; set; }
    public string   RecruiterEmail { get; set; } = string.Empty;
    public Guid     CandidateId    { get; set; }
    public string   CandidateEmail { get; set; } = string.Empty;
    public Guid     JobId          { get; set; }
    public Guid     ApplicationId  { get; set; }
    public string   Title          { get; set; } = string.Empty;
    public DateTime ScheduledAt    { get; set; }
    public int      DurationMinutes { get; set; }
    public string?  Notes          { get; set; }
    public string   Status         { get; set; } = "scheduled";
    public string   MeetingLink    { get; set; } = string.Empty;
    public DateTime CreatedAt      { get; set; }
}
