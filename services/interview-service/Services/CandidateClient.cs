using System.Net.Http.Headers;

namespace Vettly.InterviewService.Services;

public record CandidateInfo(string Email, Guid UserId);

public class CandidateClient(HttpClient client)
{
    public async Task<CandidateInfo?> GetCandidateInfoAsync(string bearerToken, Guid candidateId)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", bearerToken);

        var response = await client.GetAsync($"/api/candidates/{candidateId}/email");
        if (!response.IsSuccessStatusCode) return null;

        var data = await response.Content.ReadFromJsonAsync<CandidateEmailDto>();
        return data is null ? null : new CandidateInfo(data.Email, data.UserId);
    }

    private record CandidateEmailDto(string Email, Guid UserId);
}
