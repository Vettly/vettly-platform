using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Vettly.Shared.Middleware
{
    public static class JwtClaimsExtensions
    {
        public static Guid GetUserID(this ClaimsPrincipal user)
        {
            var subjectClaim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub");
            if (subjectClaim == null)
                throw new InvalidOperationException("User ID claim not found");
            return Guid.Parse(subjectClaim.Value);
        }
        public static string GetEmail(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Email)?.Value
                   ?? user.FindFirst("email")?.Value
                   ?? string.Empty;
        }

        public static string GetFirstName(this ClaimsPrincipal user)
        {
            return user.FindFirst("firstName")?.Value ?? string.Empty;
        }
        public static string GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value
                   ?? user.FindFirst("role")?.Value
                   ?? string.Empty;
        }

    }
}
