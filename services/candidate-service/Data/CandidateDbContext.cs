using Microsoft.EntityFrameworkCore;
using Vettly.CandidateService.Models;

namespace Vettly.CandidateService.Data
{
    public class CandidateDbContext:DbContext
    {

        public CandidateDbContext(DbContextOptions<CandidateDbContext> options) : base(options)
        {
        }

        public DbSet<CandidateProfile> Profiles => Set<CandidateProfile>();

        public DbSet<Experience> Experiences => Set<Experience>();

        public DbSet<Education> Educations => Set<Education>();

        public DbSet<Skill> Skills => Set<Skill>();

        public DbSet<Resume> Resumes => Set<Resume>();

        public DbSet<Application> Applications => Set<Application>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("candidate");
            modelBuilder.Entity<CandidateProfile>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasIndex(entity => entity.UserId).IsUnique();
                entity.HasIndex(entity => entity.Email).IsUnique();
                entity.Property(entity => entity.FirstName).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.LastName).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Headline).HasMaxLength(255);
                entity.Property(entity => entity.Phone).HasMaxLength(15);
                entity.Property(entity => entity.Location).HasMaxLength(100);
            });
            modelBuilder.Entity<Experience>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasOne(entity => entity.Profile)
                    .WithMany(profile => profile.Experiences)
                    .HasForeignKey(entity => entity.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.Property(entity => entity.Company).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Role).IsRequired().HasMaxLength(255);
            });

            modelBuilder.Entity<Education>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasOne(entity => entity.Profile)
                    .WithMany(profile => profile.Educations)
                    .HasForeignKey(entity => entity.ProfileID)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.Property(entity => entity.Institution).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Degree).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Field).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.Gpa).HasPrecision(3, 2);
            });

            modelBuilder.Entity<Skill>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasOne(entity => entity.Profile)
                    .WithMany(profile => profile.Skills)
                    .HasForeignKey(entity => entity.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.Property(entity => entity.Name).IsRequired().HasMaxLength(100);
                entity.Property(entity => entity.Level).HasMaxLength(20);
            });

            modelBuilder.Entity<Resume>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasOne(entity => entity.Profile)
                    .WithMany(profile => profile.Resumes)
                    .HasForeignKey(entity => entity.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.Property(entity => entity.FileName).IsRequired().HasMaxLength(255);
                entity.Property(entity => entity.S3Key).IsRequired().HasMaxLength(500);
                entity.Property(entity => entity.S3Url).IsRequired().HasMaxLength(500);
            });

            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasKey(entity => entity.Id);
                entity.HasOne(entity => entity.Candidate)
                    .WithMany(profile => profile.Applications)
                    .HasForeignKey(entity => entity.CandidateId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(entity => entity.Resume)
                    .WithMany()
                    .HasForeignKey(entity => entity.ResumeId)
                    .OnDelete(DeleteBehavior.Restrict);
                 entity.Property(entity => entity.Status).IsRequired().HasMaxLength(30);
                 entity.Property(entity => entity.AiScore).HasPrecision(5, 2);
                 entity.Property(entity => entity.MathScore).HasPrecision(5, 2);
            });
        }
    }
}
