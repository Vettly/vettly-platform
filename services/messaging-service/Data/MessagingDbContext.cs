using Microsoft.EntityFrameworkCore;
using Vettly.MessagingService.Models;

namespace Vettly.MessagingService.Data;

public class MessagingDbContext : DbContext
{
    public MessagingDbContext(DbContextOptions<MessagingDbContext> options) : base(options)
    {
    }

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("messaging");

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasIndex(entity => entity.ApplicationId).IsUnique();
            entity.HasIndex(entity => entity.CandidateUserId);
            entity.HasIndex(entity => entity.RecruiterUserId);
            entity.HasIndex(entity => entity.LastMessageAt).IsDescending();
            entity.Property(entity => entity.JobTitle).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.CompanyName).HasMaxLength(255);
            entity.Property(entity => entity.CandidateName).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.RecruiterName).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.LastMessagePreview).HasMaxLength(300);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasOne(entity => entity.Conversation)
                .WithMany(conversation => conversation.Messages)
                .HasForeignKey(entity => entity.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(entity => new { entity.ConversationId, entity.SentAt });
            entity.Property(entity => entity.Body).IsRequired().HasMaxLength(4000);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(entity => entity.Id);
            entity.HasIndex(entity => new { entity.RecipientUserId, entity.CreatedAt });
            entity.Property(entity => entity.Type).IsRequired().HasMaxLength(40);
            entity.Property(entity => entity.Title).IsRequired().HasMaxLength(255);
            entity.Property(entity => entity.Body).HasMaxLength(500);
        });
    }
}
