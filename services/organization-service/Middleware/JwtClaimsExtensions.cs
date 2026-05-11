using System.Security.Claims;

namespace Vettly.OrganizationService.Middleware;

public static class JwtClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? user.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }

    public static string GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Role)
               ?? user.FindFirstValue("role")
               ?? string.Empty;
    }
}
