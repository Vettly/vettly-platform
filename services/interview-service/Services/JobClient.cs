using System.Net.Http.Headers;
using Vettly.Shared.DTOs.Job;

namespace Vettly.InterviewService.Services;

public class JobClient(HttpClient client, ILogger<JobClient> logger)
{
    public async Task MoveToInterviewStageAsync(
        string bearerToken,
        Guid jobId,
        Guid applicationId,
        Guid candidateId)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", bearerToken);

        var req = new UpdatePipelineRequest
        {
            ApplicationId = applicationId,
            CandidateId   = candidateId,
            Stage         = "interview",
        };

        try
        {
            var response = await client.PostAsJsonAsync(
                $"/api/jobs/{jobId}/pipeline/move", req);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Pipeline move to interview returned {Status} for job {JobId}",
                    response.StatusCode, jobId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to move candidate to interview stage for job {JobId}", jobId);
        }
    }
}
