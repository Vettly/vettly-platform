using Vettly.AuthService.Models;

namespace Vettly.AuthService.Services
{
    public interface IAuthService
    {
        Task<(User? user,string? error)> RegisterAsync(
            string email, string password, string role, string firstName, string lastName);

        Task<(User? user,string? error)> LoginAsync(string email, string password);

        Task<User> GetUserByIdAsync(Guid userId);
    }
}
