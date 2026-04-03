using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Vettly.AuthService.Services;
using Vettly.Shared.DTOs;

namespace Vettly.AuthService.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _config;

        public AuthController(IAuthService authService, ITokenService tokenService, IConfiguration config)
        {
            _authService = authService;
            _tokenService = tokenService;
            _config = config;
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var expiryDays = int.Parse(_config["Jwt:RefreshTokenExpirationDays"]!);
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !string.Equals(_config["ASPNETCORE_ENVIRONMENT"], "Development", StringComparison.OrdinalIgnoreCase),
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth",
                MaxAge = TimeSpan.FromDays(expiryDays)
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            var (user, error) = await _authService.RegisterAsync(
                req.Email, req.Password, req.Role, req.FirstName, req.LastName);

            if (error is not null)
                return BadRequest(new { message = error });

            var accessToken = _tokenService.GenerateAccessToken(user!);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.StoreRefreshTokenAsync(user!.Id, refreshToken);
            SetRefreshTokenCookie(refreshToken);

            return Ok(new AuthResponse
            {
                AccessToken = accessToken,
                Role = user.Role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var (user, error) = await _authService.LoginAsync(req.Email, req.Password);

            if (error is not null)
                return Unauthorized(new { message = error });

            var accessToken = _tokenService.GenerateAccessToken(user!);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.StoreRefreshTokenAsync(user!.Id, refreshToken);
            SetRefreshTokenCookie(refreshToken);

            return Ok(new AuthResponse
            {
                AccessToken = accessToken,
                Role = user.Role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "No refresh token" });

            var isValid = await _tokenService.ValidateRefreshTokenAsync(req.UserId, refreshToken);
            if (!isValid)
                return Unauthorized(new { message = "Invalid or expired refresh token" });

            var user = await _authService.GetUserByIdAsync(req.UserId);
            if (user is null)
                return Unauthorized(new { message = "User not found" });

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            await _tokenService.RevokeRefreshTokenAsync(req.UserId);
            await _tokenService.StoreRefreshTokenAsync(req.UserId, newRefreshToken);
            SetRefreshTokenCookie(newRefreshToken);

            return Ok(new AuthResponse
            {
                AccessToken = newAccessToken,
                Role = user.Role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = Guid.Parse(User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value);
            var token = Request.Headers.Authorization.ToString().Replace("Bearer ", "");

            var expiryMins = int.Parse(_config["Jwt:AccessTokenExpirationMinutes"]!);
            await _tokenService.BlacklistAccessTokenAsync(token, TimeSpan.FromMinutes(expiryMins));
            await _tokenService.RevokeRefreshTokenAsync(userId);

            Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });

            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = Guid.Parse(User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value);
            var user = await _authService.GetUserByIdAsync(userId);

            if (user is null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Role,
                user.FirstName,
                user.LastName,
            });
        }
    }
}
