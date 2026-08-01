using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vettly.ESignService.DTOs;
using Vettly.ESignService.Services;
using Vettly.Shared.Middleware;

namespace Vettly.ESignService.Controllers;

[ApiController]
[Route("api/esign/documents")]
[Authorize]
public class DocumentsController(IDocumentService documentService) : ControllerBase
{
    private string? ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string ClientUserAgent => Request.Headers.UserAgent.ToString();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDocumentRequest req)
    {
        var userId = User.GetUserID();
        try
        {
            var document = await documentService.CreateAsync(userId, req, ClientIp, ClientUserAgent);
            if (document is null) return Forbid();
            return Ok(document);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userId = User.GetUserID();
        var documents = await documentService.GetMyDocumentsAsync(userId);
        return Ok(documents);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDocument(Guid id)
    {
        var userId = User.GetUserID();
        var document = await documentService.GetDocumentAsync(userId, id, ClientIp, ClientUserAgent);
        if (document is null) return Forbid();
        return Ok(document);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var userId = User.GetUserID();
        var download = await documentService.GetDownloadUrlAsync(userId, id, ClientIp, ClientUserAgent);
        if (download is null) return Forbid();
        return Ok(download);
    }

    [HttpPost("{id}/sign")]
    public async Task<IActionResult> Sign(Guid id)
    {
        var userId = User.GetUserID();
        var document = await documentService.SignAsync(userId, id, ClientIp, ClientUserAgent);
        if (document is null) return Forbid();
        return Ok(document);
    }
}
