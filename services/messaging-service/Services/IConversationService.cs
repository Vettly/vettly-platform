using Vettly.MessagingService.DTOs;

namespace Vettly.MessagingService.Services;

public interface IConversationService
{
    Task<List<ConversationSummaryResponse>> GetMyConversationsAsync(Guid userId);
    Task<ConversationSummaryResponse?> GetOrCreateConversationAsync(Guid userId, Guid applicationId);
    Task<List<MessageResponse>?> GetMessagesAsync(Guid userId, Guid conversationId, DateTime? before, int limit);
    Task<MessageResponse?> SendMessageAsync(Guid userId, Guid conversationId, string body);
    Task<bool> MarkReadAsync(Guid userId, Guid conversationId);
}
