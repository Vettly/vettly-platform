using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Vettly.AuthService.Data;
using Vettly.AuthService.Models;
using Vettly.AuthService.Services;

namespace Vettly.AuthService.Controllers;

[ApiController]
[Route("api/auth")]
public class OAuthController : ControllerBase
{
    private readonly AuthDbContext  _db;
    private readonly ITokenService  _tokenService;
    private readonly IConfiguration _config;

    public OAuthController(AuthDbContext db, ITokenService tokenService, IConfiguration config)
    {
        _db           = db;
        _tokenService = tokenService;
        _config       = config;
    }

    private const string DefaultRole = "candidate";
    private static readonly string[] AllowedRoles = ["candidate", "recruiter"];

    [HttpGet("google")]
    public IActionResult Google([FromQuery] string role = DefaultRole, [FromQuery] string mode = "register")
    {
        if (!AllowedRoles.Contains(role)) role = DefaultRole;

        return Challenge(new AuthenticationProperties
        {
            RedirectUri = $"/api/auth/oauth/callback?role={role}&mode={mode}"
        }, "Google");
    }

    [HttpGet("github")]
    public IActionResult GitHub([FromQuery] string role = DefaultRole, [FromQuery] string mode = "register")
    {
        if (!AllowedRoles.Contains(role)) role = DefaultRole;

        return Challenge(new AuthenticationProperties
        {
            RedirectUri = $"/api/auth/oauth/callback?role={role}&mode={mode}"
        }, "GitHub");
    }

    [HttpGet("oauth/callback")]
    public async Task<IActionResult> Callback([FromQuery] string role = DefaultRole, [FromQuery] string mode = "register")
    {
        if (!AllowedRoles.Contains(role)) role = DefaultRole;

        var frontendUrl = _config["Frontend:BaseUrl"]!;
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (!result.Succeeded)
            return Redirect($"{frontendUrl}/auth/login?error=oauth_failed");

        var claims    = result.Principal!.Claims.ToList();
        var email     = claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Email)?.Value;
        var firstName = claims.FirstOrDefault(claim => claim.Type == ClaimTypes.GivenName)?.Value
                        ?? claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Name)?.Value
                        ?? "User";
        var lastName  = claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Surname)?.Value ?? "";

        if (email is null)
            return Redirect($"{frontendUrl}/auth/login?error=no_email");

        var normalizedEmail = email.ToLowerInvariant();
        var isNewUser = false;
        var user = await _db.Users.FirstOrDefaultAsync(user => user.Email == normalizedEmail);

        if (user is null)
        {
            if (mode == "login")
                return Redirect($"{frontendUrl}/auth/login?error=account_not_found");

            isNewUser = true;
            user = new User
            {
                Email        = normalizedEmail,
                PasswordHash = string.Empty,
                Role         = role,
                FirstName    = firstName,
                LastName     = lastName,
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var accessToken  = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.StoreRefreshTokenAsync(user.Id, refreshToken);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure   = Request.IsHttps,
            SameSite = SameSiteMode.None,
            Path     = "/api/auth",
            Expires  = DateTime.UtcNow.AddDays(
                int.Parse(_config["Jwt:RefreshTokenExpirationDays"]!))
        });

        return Redirect($"{frontendUrl}/auth/callback?token={accessToken}&isNewUser={isNewUser}");
    }
}
