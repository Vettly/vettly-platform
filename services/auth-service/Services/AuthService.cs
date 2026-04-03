using Microsoft.EntityFrameworkCore;
using Vettly.AuthService.Data;
using Vettly.AuthService.Models;

namespace Vettly.AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _db;

        public AuthService(AuthDbContext db)
        {
            _db = db;
        }
        public async Task<(User? user, string? error)> RegisterAsync(
        string email, string password, string role,
        string firstName, string lastName)
        {
            
            var exists = await _db.Users.AnyAsync(user => user.Email == email);
            if (exists)
                return (null, "Email already registered");

           
            if (role != "candidate" && role != "recruiter")
                return (null, "Role must be candidate or recruiter");

            var user = new User
            {
                Email = email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = role,
                FirstName = firstName.Trim(),
                LastName = lastName.Trim(),
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return (user, null);
        }
        public async Task<(User? user, string? error)> LoginAsync(
       string email, string password)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(user => user.Email == email.ToLower().Trim());

            if (user is null)
                return (null, "Invalid email or password");

            if (!user.IsActive)
                return (null, "Account is deactivated");

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return (null, "Invalid email or password");

            return (user, null);
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _db.Users.FindAsync(userId);
        }

    }
}
