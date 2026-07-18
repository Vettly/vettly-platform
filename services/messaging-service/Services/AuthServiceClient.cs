using System.Net.Http.Json;
using Vettly.MessagingService.DTOs;

namespace Vettly.MessagingService.Services;

public class AuthServiceClient(HttpClient client)
{
    public async Task<UserNameResponse?> GetUserNameAsync(Guid userId)
    {
        var response = await client.GetAsync($"/api/internal/users/{userId}/name");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<UserNameResponse>();
    }
}
