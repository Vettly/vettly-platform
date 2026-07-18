using Microsoft.AspNetCore.Mvc;
using Vettly.AuthService.Data;

namespace Vettly.AuthService.Controllers;

[ApiController]
[Route("api/internal/users")]
public class InternalController(AuthDbContext db) : ControllerBase
{
    [HttpGet("{id}/name")]
    public async Task<IActionResult> GetUserName(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        return Ok(new { user.FirstName, user.LastName });
    }
}
