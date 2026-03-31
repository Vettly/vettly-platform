using Microsoft.EntityFrameworkCore;
using Vettly.AuthService.Models;

namespace Vettly.AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasIndex(entity => entity.Email).IsUnique();
                entity.Property(entity => entity.Email).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Role).IsRequired().HasMaxLength(20);
            });
        }
    }
}
