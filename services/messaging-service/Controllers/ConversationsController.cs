using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.MessagingService.DTOs;
using Vettly.MessagingService.Services;
using Vettly.Shared.Middleware;

namespace Vettly.MessagingService.Controllers;

[ApiController]
[Route("api/messaging/conversations")]
[Authorize]
public class ConversationsController(IConversationService conversationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var userId = User.GetUserID();
        var conversations = await conversationService.GetMyConversationsAsync(userId);
        return Ok(conversations);
    }

    [HttpPost]
    public async Task<IActionResult> GetOrCreateConversation([FromBody] CreateConversationRequest req)
    {
        var userId = User.GetUserID();
        var conversation = await conversationService.GetOrCreateConversationAsync(userId, req.ApplicationId);
        if (conversation is null) return Forbid();
        return Ok(conversation);
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id, [FromQuery] DateTime? before, [FromQuery] int limit = 50)
    {
        var userId = User.GetUserID();
        var messages = await conversationService.GetMessagesAsync(userId, id, before, Math.Clamp(limit, 1, 100));
        if (messages is null) return Forbid();
        return Ok(messages);
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Body))
            return BadRequest(new { message = "Message body is required" });

        var userId = User.GetUserID();
        var message = await conversationService.SendMessageAsync(userId, id, req.Body.Trim());
        if (message is null) return Forbid();
        return Ok(message);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = User.GetUserID();
        var ok = await conversationService.MarkReadAsync(userId, id);
        if (!ok) return Forbid();
        return NoContent();
    }
}
