using System.Net.Http.Json;

namespace Vettly.CandidateService.Services;

public record JobPreviewScore(string JobId, double AiScore, double MatchScore);
public record JobPreviewInfo(string Id, string Description, IEnumerable<string> RequiredSkills, IEnumerable<string> OptionalSkills);

public class ScreeningClient(HttpClient client)
{
    public async Task RequestScreeningAsync(
        string applicationId,
        string resumeS3Key,
        string jobId,
        string candidateName,
        string callbackUrl)
    {
        await client.PostAsJsonAsync("/screen-resume", new
        {
            application_id = applicationId,
            resume_s3_key  = resumeS3Key,
            job_id         = jobId,
            candidate_name = candidateName,
            callback_url   = callbackUrl,
        });
    }

    public async Task<List<JobPreviewScore>> GetBatchPreviewAsync(
        string resumeS3Key, IEnumerable<JobPreviewInfo> jobs)
    {
        var response = await client.PostAsJsonAsync("/batch-preview", new
        {
            resume_s3_key = resumeS3Key,
            jobs = jobs.Select(j => new
            {
                id              = j.Id,
                description     = j.Description,
                required_skills = j.RequiredSkills,
                optional_skills = j.OptionalSkills,
            }),
        });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<JobPreviewScore>>()
               ?? [];
    }
}
