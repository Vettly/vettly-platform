using Microsoft.EntityFrameworkCore;
using Vettly.OrganizationService.Models;

namespace Vettly.OrganizationService.Data;

public class OrganizationDbContext(DbContextOptions<OrganizationDbContext> options) : DbContext(options)
{
    public DbSet<Organization>       Organizations       => Set<Organization>();
    public DbSet<OrganizationMember> OrganizationMembers => Set<OrganizationMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("organizations");

        modelBuilder.Entity<Organization>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Name).IsRequired().HasMaxLength(200);
            e.Property(o => o.Industry).HasMaxLength(100);
            e.Property(o => o.Website).HasMaxLength(300);
            e.Property(o => o.JoinCode).HasMaxLength(20);
            e.HasIndex(o => o.JoinCode).IsUnique();
        });

        modelBuilder.Entity<OrganizationMember>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Role).IsRequired().HasMaxLength(20);
            e.HasIndex(m => m.RecruiterId);
            e.HasOne(m => m.Organization)
             .WithMany(o => o.Members)
             .HasForeignKey(m => m.OrganizationId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
