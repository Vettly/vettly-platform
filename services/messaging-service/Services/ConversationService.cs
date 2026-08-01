using Microsoft.EntityFrameworkCore;
using Vettly.MessagingService.Data;
using Vettly.MessagingService.DTOs;
using Vettly.MessagingService.Models;

namespace Vettly.MessagingService.Services;

public class ConversationService(
    MessagingDbContext db,
    ParticipantResolver participantResolver,
    MessagingHubPusher hubPusher,
    INotificationService notificationService,
    ILogger<ConversationService> logger) : IConversationService
{
    public async Task<List<ConversationSummaryResponse>> GetMyConversationsAsync(Guid userId)
    {
        var conversations = await db.Conversations
            .Where(c => c.CandidateUserId == userId || c.RecruiterUserId == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        return conversations.Select(c => MapSummary(c, userId)).ToList();
    }

    public async Task<ConversationSummaryResponse?> GetOrCreateConversationAsync(Guid userId, Guid applicationId)
    {
        var existing = await db.Conversations
            .FirstOrDefaultAsync(c => c.ApplicationId == applicationId);

        if (existing is not null)
        {
            if (existing.CandidateUserId != userId && existing.RecruiterUserId != userId)
                return null; // not a participant

            return MapSummary(existing, userId);
        }

        var participants = await participantResolver.ResolveAsync(applicationId);
        if (participants is null) return null;

        if (participants.CandidateUserId != userId && participants.RecruiterUserId != userId)
            return null; // not a participant

        var conversation = new Conversation
        {
            ApplicationId = participants.ApplicationId,
            JobId = participants.JobId,
            JobTitle = participants.JobTitle,
            CompanyName = participants.CompanyName,
            CandidateUserId = participants.CandidateUserId,
            CandidateName = participants.CandidateName,
            RecruiterUserId = participants.RecruiterUserId,
            RecruiterName = participants.RecruiterName,
        };

        db.Conversations.Add(conversation);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // race: another request created it first — fetch that one instead
            var created = await db.Conversations
                .FirstOrDefaultAsync(c => c.ApplicationId == applicationId);
            if (created is null) throw;
            return MapSummary(created, userId);
        }

        return MapSummary(conversation, userId);
    }

    public async Task<List<MessageResponse>?> GetMessagesAsync(
        Guid userId, Guid conversationId, DateTime? before, int limit)
    {
        var conversation = await db.Conversations.FindAsync(conversationId);
        if (conversation is null) return null;
        if (conversation.CandidateUserId != userId && conversation.RecruiterUserId != userId) return null;

        var query = db.Messages.Where(m => m.ConversationId == conversationId);
        if (before is not null)
            query = query.Where(m => m.SentAt < before);

        var messages = await query
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .ToListAsync();

        messages.Reverse(); // oldest-first for the client

        return messages.Select(MapMessage).ToList();
    }

    public async Task<MessageResponse?> SendMessageAsync(Guid userId, Guid conversationId, string body)
    {
        var conversation = await db.Conversations.FindAsync(conversationId);
        if (conversation is null) return null;
        if (conversation.CandidateUserId != userId && conversation.RecruiterUserId != userId) return null;

        var isFromCandidate = conversation.CandidateUserId == userId;
        var recipientId = isFromCandidate ? conversation.RecruiterUserId : conversation.CandidateUserId;

        var message = new Message
        {
            ConversationId = conversationId,
            SenderUserId = userId,
            Body = body,
        };
        db.Messages.Add(message);

        conversation.LastMessagePreview = body.Length > 300 ? body[..300] : body;
        conversation.LastMessageAt = message.SentAt;
        conversation.LastMessageSenderId = userId;

        var recipientUnreadWasZero = isFromCandidate
            ? conversation.RecruiterUnreadCount == 0
            : conversation.CandidateUnreadCount == 0;

        if (isFromCandidate)
            conversation.RecruiterUnreadCount++;
        else
            conversation.CandidateUnreadCount++;

        await db.SaveChangesAsync();

        var mapped = MapMessage(message);
        await hubPusher.PushMessageAsync(recipientId, mapped);
        await hubPusher.PushConversationUpdatedAsync(recipientId, MapSummary(conversation, recipientId));
        await hubPusher.PushConversationUpdatedAsync(userId, MapSummary(conversation, userId));

        if (recipientUnreadWasZero)
        {
            var senderName = isFromCandidate ? conversation.CandidateName : conversation.RecruiterName;
            try
            {
                await notificationService.CreateAsync(
                    recipientId,
                    NotificationType.MessageReply,
                    $"{senderName} sent you a message",
                    conversation.LastMessagePreview,
                    conversation.JobId,
                    conversation.ApplicationId,
                    conversation.Id);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Failed to create message_reply notification for conversation {ConversationId}",
                    conversation.Id);
            }
        }

        return mapped;
    }

    public async Task<bool> MarkReadAsync(Guid userId, Guid conversationId)
    {
        var conversation = await db.Conversations.FindAsync(conversationId);
        if (conversation is null) return false;
        if (conversation.CandidateUserId != userId && conversation.RecruiterUserId != userId) return false;

        if (conversation.CandidateUserId == userId)
            conversation.CandidateUnreadCount = 0;
        else
            conversation.RecruiterUnreadCount = 0;

        await db.SaveChangesAsync();
        await hubPusher.PushConversationUpdatedAsync(userId, MapSummary(conversation, userId));
        return true;
    }

    private static ConversationSummaryResponse MapSummary(Conversation c, Guid viewerUserId)
    {
        var isCandidate = c.CandidateUserId == viewerUserId;
        return new ConversationSummaryResponse
        {
            Id = c.Id,
            ApplicationId = c.ApplicationId,
            JobId = c.JobId,
            JobTitle = c.JobTitle,
            CompanyName = c.CompanyName,
            OtherPartyName = isCandidate ? c.RecruiterName : c.CandidateName,
            LastMessagePreview = c.LastMessagePreview,
            LastMessageAt = c.LastMessageAt,
            UnreadCount = isCandidate ? c.CandidateUnreadCount : c.RecruiterUnreadCount,
        };
    }

    private static MessageResponse MapMessage(Message m) => new()
    {
        Id = m.Id,
        ConversationId = m.ConversationId,
        SenderUserId = m.SenderUserId,
        Body = m.Body,
        SentAt = m.SentAt,
    };
}
