namespace Vettly.Shared.DTOs.Job;

public class UpdateJobStatusRequest
{
    public string Status { get; set; } = string.Empty;
    // draft | open | closed | archived
}