using Vettly.AuthService.Models;

namespace Vettly.AuthService.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);

        string GenerateRefreshToken();

        Task StoreRefreshTokenAsync(Guid userId, string refreshToken);

        Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken);

        Task RevokeRefreshTokenAsync(Guid userId);

        Task BlacklistAccessTokenAsync(string token, TimeSpan expiry);

        Task<bool> IsTokenBlacklistedAsync(string token);
    }
}
