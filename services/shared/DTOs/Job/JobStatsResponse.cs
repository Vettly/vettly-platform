namespace Vettly.Shared.DTOs.Job;

public class JobStatsResponse
{
    public int TotalJobs { get; set; }
    public int OpenJobs { get; set; }
    public int TotalApplicants { get; set; }
    public Dictionary<string, int> PipelineFunnel { get; set; } = [];
    public List<JobApplicantBreakdown> PerJobBreakdown { get; set; } = [];
    public List<TimeSeriesPoint> ApplicationsOverTime { get; set; } = [];
}

public class JobApplicantBreakdown
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int ApplicantCount { get; set; }
    public Dictionary<string, int> StageBreakdown { get; set; } = [];
}

public class TimeSeriesPoint
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}
