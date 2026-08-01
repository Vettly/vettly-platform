namespace Vettly.ESignService.Services
{
    public interface IR2StorageService
    {
        Task UploadPdfAsync(string key, byte[] bytes);
        string GetPublicUrl(string key);
    }
}
