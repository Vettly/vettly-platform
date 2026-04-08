namespace Vettly.CandidateService.Services
{
    public interface IS3Service
    {
        Task<(string key, string url)> UploadResumeAsync(
          IFormFile file, Guid userId);
        Task<(string key, string url)> UploadAvatarAsync(
            IFormFile file, Guid userId);
        Task DeleteFileAsync(string key);
        string GetPublicUrl(string key);
    }
}
