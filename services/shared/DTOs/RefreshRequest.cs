
namespace Vettly.Shared.DTOs
{
    public class RefreshRequest
    {
        public Guid UserId { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
    }
}
