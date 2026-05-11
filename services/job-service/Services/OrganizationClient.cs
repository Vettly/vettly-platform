using System.Net.Http.Headers;
using Vettly.Shared.DTOs.Organization;

namespace Vettly.JobService.Services;

public class OrganizationClient(HttpClient client)
{
    public async Task<OrganizationResponse?> GetByRecruiterAsync(string bearerToken)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", bearerToken);

        var response = await client.GetAsync("/api/organizations/mine");

        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<OrganizationResponse>();
    }
}
