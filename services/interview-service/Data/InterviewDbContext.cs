using Microsoft.EntityFrameworkCore;
using Vettly.InterviewService.Models;

namespace Vettly.InterviewService.Data;

public class InterviewDbContext : DbContext
{
    public InterviewDbContext(DbContextOptions<InterviewDbContext> options)
        : base(options) { }

    public DbSet<Interview> Interviews => Set<Interview>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("interviews");

        modelBuilder.Entity<Interview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RecruiterId);
            entity.HasIndex(e => e.CandidateId);
            entity.HasIndex(e => e.CandidateUserId);
            entity.HasIndex(e => e.JobId);
            entity.HasIndex(e => e.ApplicationId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.RecruiterEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CandidateEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.MeetingLink).IsRequired().HasMaxLength(2048);
        });
    }
}
