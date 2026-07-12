namespace Vettly.InterviewService.Models;

public class Interview
{
    public Guid     Id               { get; set; } = Guid.NewGuid();
    public Guid     RecruiterId     { get; set; }
    public string   RecruiterEmail  { get; set; } = string.Empty;
    public Guid     CandidateId     { get; set; }   // CandidateProfile.Id (used for pipeline)
    public Guid     CandidateUserId { get; set; }   // auth user Id (used for candidate-side queries)
    public string   CandidateEmail  { get; set; } = string.Empty;
    public Guid     JobId           { get; set; }
    public Guid     ApplicationId   { get; set; }
    public string   Title           { get; set; } = string.Empty;
    public DateTime ScheduledAt     { get; set; }
    public int      DurationMinutes { get; set; } = 60;
    public string?  Notes           { get; set; }
    public string   Status          { get; set; } = "scheduled";
    public string   MeetingLink     { get; set; } = string.Empty;
    public DateTime CreatedAt       { get; set; } = DateTime.UtcNow;
}
