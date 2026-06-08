using System.Net.Http.Headers;
using System.Net.Http.Json;
using Vettly.Shared.DTOs.Job;

namespace Vettly.CandidateService.Services;

public class JobClient(HttpClient client)
{
    public async Task RegisterApplicationAsync(string bearerToken,
        Guid jobId, Guid applicationId, Guid candidateId)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", bearerToken);

        await client.PostAsJsonAsync($"/api/jobs/{jobId}/pipeline/applications",
            new RegisterApplicationRequest
            {
                ApplicationId = applicationId,
                CandidateId   = candidateId,
            });
    }
}
