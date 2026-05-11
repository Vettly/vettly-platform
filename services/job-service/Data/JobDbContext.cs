using Microsoft.EntityFrameworkCore;
using Vettly.JobService.Models;

namespace Vettly.JobService.Data;

public class JobDbContext : DbContext
{
    public JobDbContext(DbContextOptions<JobDbContext> options)
        : base(options) { }

    public DbSet<JobPosting>    Jobs           => Set<JobPosting>();
    public DbSet<JobSkill>      JobSkills      => Set<JobSkill>();
    public DbSet<PipelineStage> PipelineStages => Set<PipelineStage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("jobs");

        modelBuilder.Entity<JobPosting>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RecruiterId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.JobType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.ExperienceLevel).HasMaxLength(20);
        });

        modelBuilder.Entity<JobSkill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Job)
                  .WithMany(j => j.Skills)
                  .HasForeignKey(e => e.JobId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<PipelineStage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Job)
                  .WithMany(j => j.PipelineStages)
                  .HasForeignKey(e => e.JobId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.CandidateId);
            entity.Property(e => e.Stage).IsRequired().HasMaxLength(30);
        });
    }
}