using Microsoft.EntityFrameworkCore;
using Vettly.ESignService.Models;

namespace Vettly.ESignService.Data;

public class EsignDbContext : DbContext
{
    public EsignDbContext(DbContextOptions<EsignDbContext> options) : base(options)
    {
    }

    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Signature> Signatures => Set<Signature>();
    public DbSet<AuditTrailEntry> AuditTrail => Set<AuditTrailEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("esign");

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasIndex(entity => entity.ApplicationId).IsUnique();
            entity.HasIndex(entity => entity.RecruiterUserId);
            entity.HasIndex(entity => entity.CandidateUserId);
            entity.Property(entity => entity.DocumentType).IsRequired().HasMaxLength(30);
            entity.Property(entity => entity.JobTitle).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.CompanyName).HasMaxLength(255);
            entity.Property(entity => entity.CandidateName).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.RecruiterName).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.S3Key).IsRequired().HasMaxLength(500);
            entity.Property(entity => entity.SignedS3Key).HasMaxLength(500);
            entity.Property(entity => entity.Status).IsRequired().HasMaxLength(20);
            entity.Property(entity => entity.Hash).IsRequired().HasMaxLength(64);
        });

        modelBuilder.Entity<Signature>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasOne(entity => entity.Document)
                .WithOne(document => document.Signature)
                .HasForeignKey<Signature>(entity => entity.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(entity => entity.SignatureName).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.IpAddress).HasMaxLength(64);
            entity.Property(entity => entity.UserAgent).HasMaxLength(500);
        });

        modelBuilder.Entity<AuditTrailEntry>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasOne(entity => entity.Document)
                .WithMany(document => document.AuditTrail)
                .HasForeignKey(entity => entity.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(entity => entity.DocumentId);
            entity.Property(entity => entity.Action).IsRequired().HasMaxLength(20);
            entity.Property(entity => entity.IpAddress).HasMaxLength(64);
            entity.Property(entity => entity.UserAgent).HasMaxLength(500);
        });
    }
}
