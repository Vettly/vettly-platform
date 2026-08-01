using Microsoft.EntityFrameworkCore;
using Vettly.ESignService.Data;
using Vettly.ESignService.DTOs;
using Vettly.Shared.DTOs.Events;
using Document = Vettly.ESignService.Models.Document;

namespace Vettly.ESignService.Services;

public class DocumentService(
    EsignDbContext db,
    ParticipantResolver participantResolver,
    IR2StorageService storage,
    RedisEventPublisher eventPublisher,
    ILogger<DocumentService> logger) : IDocumentService
{
    public async Task<DocumentResponse?> CreateAsync(
        Guid recruiterUserId, CreateDocumentRequest req, string? ipAddress, string? userAgent)
    {
        var existing = await db.Documents.AnyAsync(d => d.ApplicationId == req.ApplicationId);
        if (existing)
            throw new InvalidOperationException("An offer already exists for this application");

        var participants = await participantResolver.ResolveAsync(req.ApplicationId);
        if (participants is null) return null;
        if (participants.RecruiterUserId != recruiterUserId) return null; // not this job's recruiter

        var document = new Document
        {
            ApplicationId = participants.ApplicationId,
            JobId = participants.JobId,
            RecruiterUserId = participants.RecruiterUserId,
            CandidateUserId = participants.CandidateUserId,
            JobTitle = participants.JobTitle,
            CompanyName = participants.CompanyName,
            CandidateName = participants.CandidateName,
            RecruiterName = participants.RecruiterName,
            SalaryAmount = req.SalaryAmount,
            StartDate = req.StartDate,
            ExpiresAt = req.ExpiresAt,
            S3Key = $"documents/{Guid.NewGuid()}/offer.pdf",
        };

        var pdfBytes = PdfService.Render(document, null);
        document.Hash = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(pdfBytes));

        await storage.UploadPdfAsync(document.S3Key, pdfBytes);

        db.Documents.Add(document);
        db.AuditTrail.Add(new Models.AuditTrailEntry
        {
            DocumentId = document.Id,
            Action = Models.AuditAction.Created,
            ActorUserId = recruiterUserId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        });
        await db.SaveChangesAsync();

        await eventPublisher.PublishAsync(DomainEventTypes.OfferReady, new OfferReadyEvent
        {
            ApplicationId = document.ApplicationId,
            JobId = document.JobId,
            JobTitle = document.JobTitle,
            CandidateUserId = document.CandidateUserId,
        });

        return MapDocument(document, null);
    }

    public async Task<List<DocumentResponse>> GetMyDocumentsAsync(Guid userId)
    {
        var documents = await db.Documents
            .Include(d => d.Signature)
            .Where(d => d.CandidateUserId == userId || d.RecruiterUserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return documents.Select(d => MapDocument(d, d.Signature)).ToList();
    }

    public async Task<DocumentResponse?> GetDocumentAsync(
        Guid userId, Guid documentId, string? ipAddress, string? userAgent)
    {
        var document = await db.Documents
            .Include(d => d.Signature)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document is null) return null;
        if (document.CandidateUserId != userId && document.RecruiterUserId != userId) return null;

        db.AuditTrail.Add(new Models.AuditTrailEntry
        {
            DocumentId = document.Id,
            Action = Models.AuditAction.Viewed,
            ActorUserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        });
        await db.SaveChangesAsync();

        return MapDocument(document, document.Signature);
    }

    public async Task<DownloadResponse?> GetDownloadUrlAsync(
        Guid userId, Guid documentId, string? ipAddress, string? userAgent)
    {
        var document = await db.Documents.FindAsync(documentId);
        if (document is null) return null;
        if (document.CandidateUserId != userId && document.RecruiterUserId != userId) return null;

        var key = document.SignedS3Key ?? document.S3Key;

        db.AuditTrail.Add(new Models.AuditTrailEntry
        {
            DocumentId = document.Id,
            Action = Models.AuditAction.Downloaded,
            ActorUserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        });
        await db.SaveChangesAsync();

        return new DownloadResponse { Url = storage.GetPublicUrl(key) };
    }

    public async Task<DocumentResponse?> SignAsync(
        Guid candidateUserId, Guid documentId, string? ipAddress, string? userAgent)
    {
        var document = await db.Documents.FindAsync(documentId);
        if (document is null) return null;
        if (document.CandidateUserId != candidateUserId) return null;
        if (document.Status != Models.DocumentStatus.Pending) return null;

        var signature = new Models.Signature
        {
            DocumentId = document.Id,
            SignedByUserId = candidateUserId,
            SignatureName = document.CandidateName,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        };

        var pdfBytes = PdfService.Render(document, signature);
        var signedKey = $"documents/{document.Id}/offer-signed.pdf";

        try
        {
            await storage.UploadPdfAsync(signedKey, pdfBytes);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload signed PDF for document {DocumentId}", document.Id);
            throw;
        }

        document.SignedS3Key = signedKey;
        document.Hash = Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(pdfBytes));
        document.Status = Models.DocumentStatus.Signed;
        document.SignedAt = signature.SignedAt;

        db.Signatures.Add(signature);
        db.AuditTrail.Add(new Models.AuditTrailEntry
        {
            DocumentId = document.Id,
            Action = Models.AuditAction.Signed,
            ActorUserId = candidateUserId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
        });
        await db.SaveChangesAsync();

        await eventPublisher.PublishAsync(DomainEventTypes.DocumentSigned, new DocumentSignedEvent
        {
            ApplicationId = document.ApplicationId,
            JobId = document.JobId,
            JobTitle = document.JobTitle,
            CandidateName = document.CandidateName,
            RecruiterUserId = document.RecruiterUserId,
        });

        return MapDocument(document, signature);
    }

    private static DocumentResponse MapDocument(Document d, Models.Signature? signature) => new()
    {
        Id = d.Id,
        ApplicationId = d.ApplicationId,
        JobId = d.JobId,
        DocumentType = d.DocumentType,
        JobTitle = d.JobTitle,
        CompanyName = d.CompanyName,
        CandidateName = d.CandidateName,
        RecruiterName = d.RecruiterName,
        SalaryAmount = d.SalaryAmount,
        StartDate = d.StartDate,
        Status = d.Status,
        ExpiresAt = d.ExpiresAt,
        CreatedAt = d.CreatedAt,
        SignedAt = d.SignedAt,
        SignedByName = signature?.SignatureName,
    };
}
