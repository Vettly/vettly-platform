using Vettly.ESignService.DTOs;

namespace Vettly.ESignService.Services;

public interface IDocumentService
{
    Task<DocumentResponse?> CreateAsync(
        Guid recruiterUserId, CreateDocumentRequest req, string? ipAddress, string? userAgent);
    Task<List<DocumentResponse>> GetMyDocumentsAsync(Guid userId);
    Task<DocumentResponse?> GetDocumentAsync(
        Guid userId, Guid documentId, string? ipAddress, string? userAgent);
    Task<DownloadResponse?> GetDownloadUrlAsync(
        Guid userId, Guid documentId, string? ipAddress, string? userAgent);
    Task<DocumentResponse?> SignAsync(Guid candidateUserId, Guid documentId, string? ipAddress, string? userAgent);
}
