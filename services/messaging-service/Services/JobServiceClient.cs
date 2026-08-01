using System.Net.Http.Json;
using Vettly.Shared.DTOs.Job;

namespace Vettly.MessagingService.Services;

public class JobServiceClient(HttpClient client)
{
    public async Task<JobResponse?> GetJobAsync(Guid jobId)
    {
        var response = await client.GetAsync($"/api/jobs/{jobId}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<JobResponse>();
    }
}
