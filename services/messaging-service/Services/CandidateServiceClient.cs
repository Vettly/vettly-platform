using System.Net.Http.Json;
using Vettly.MessagingService.DTOs;

namespace Vettly.MessagingService.Services;

public class CandidateServiceClient(HttpClient client)
{
    public async Task<ApplicationParticipantsResponse?> GetApplicationParticipantsAsync(Guid applicationId)
    {
        var response = await client.GetAsync($"/api/internal/applications/{applicationId}/participants");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ApplicationParticipantsResponse>();
    }
}
