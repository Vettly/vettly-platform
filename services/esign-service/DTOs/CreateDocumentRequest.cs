namespace Vettly.ESignService.DTOs;

public class CreateDocumentRequest
{
    public Guid ApplicationId { get; set; }
    public int SalaryAmount { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? ExpiresAt { get; set; }
}
