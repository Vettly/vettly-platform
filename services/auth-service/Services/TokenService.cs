using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Vettly.AuthService.Models;
using IDatabase = StackExchange.Redis.IDatabase;

namespace Vettly.AuthService.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly IDatabase _redis;

        public TokenService(IConfiguration config, IConnectionMultiplexer redis)
        {
            _config = config;
            _redis = redis.GetDatabase();
        }

        public string GenerateAccessToken(User user)
        {
            var claims = new[]
            {   
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("firstName", user.FirstName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),// Unique identifier for the token used to prevenet replay attacks
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:AccessTokenExpirationMinutes"]!));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);

        }

        public string GenerateRefreshToken()
        {
           var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }

        public async Task StoreRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var key = $"refresh_token:{userId}";
            var expiry = TimeSpan.FromDays(
                int.Parse(_config["Jwt:RefreshTokenExpirationDays"]!));

            //hash the token before storing for security
            var hashedToken = HashToken(refreshToken);
            await _redis.StringSetAsync(key, hashedToken, expiry);
        }

        public async Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var key = $"refresh_token:{userId}";
            var storedHash = await _redis.StringGetAsync(key);
            if (storedHash.IsNullOrEmpty) return false;
            
            return storedHash == HashToken(refreshToken);
        }

        public async Task RevokeRefreshTokenAsync(Guid userId)
        {
            var key = $"refresh_token:{userId}";
            await _redis.KeyDeleteAsync(key);
        }

        public async Task BlacklistAccessTokenAsync(string token, TimeSpan expiry)
        {
            var jti = GetJtiFromToken(token);
            if (jti is null) return;
            await _redis.StringSetAsync($"blacklist:{jti}", "true", expiry);
        }

        public async Task<bool> IsTokenBlacklistedAsync(string token)
        {
            var jti = GetJtiFromToken(token);
            if (jti is null) return false;

            return await _redis.KeyExistsAsync($"blacklist:{jti}");
        }
        private static string HashToken(string token)
        {
           var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        private string? GetJtiFromToken(string token
            )
        {
            var handler = new JwtSecurityTokenHandler();
            if(!handler.CanReadToken(token)) return null;
            var jwt = handler.ReadJwtToken(token);
            return jwt.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Jti)?.Value;

        }
    }
}
