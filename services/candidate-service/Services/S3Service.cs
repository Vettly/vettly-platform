using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace Vettly.CandidateService.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _config;

        public S3Service(IConfiguration config)
        {
            _config = config;

            var credentials = new BasicAWSCredentials(
                config["R2:AccessKey"]!,
                config["R2:SecretKey"]!
            );

            _s3 = new AmazonS3Client(credentials, new AmazonS3Config
            {
                ServiceURL = $"https://{config["R2:AccountId"]}.r2.cloudflarestorage.com",
            });
        }

        public async Task<(string key, string url)> UploadResumeAsync(
            IFormFile file, Guid userId)
        {
            var key = $"resumes/{userId}/{Guid.NewGuid()}_{file.FileName}";
            return await UploadFileAsync(file, key);
        }

        public async Task<(string key, string url)> UploadAvatarAsync(
            IFormFile file, Guid userId)
        {
            var ext = Path.GetExtension(file.FileName).ToLower();
            var key = $"avatars/{userId}/avatar{ext}";
            // same key every time — overwrites old avatar automatically
            return await UploadFileAsync(file, key);
        }

        public async Task DeleteFileAsync(string key)
        {
            await _s3.DeleteObjectAsync(_config["R2:BucketName"]!, key);
        }

        public string GetPublicUrl(string key)
        {
            var publicUrl = _config["R2:PublicUrl"];

            if (!string.IsNullOrEmpty(publicUrl))
                return $"{publicUrl}/{key}";

            // presigned URL for private buckets (Sig V4 is default in modern SDK)
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _config["R2:BucketName"]!,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddDays(7),
            };
            return _s3.GetPreSignedURL(request);
        }

        // ── SHARED UPLOAD HELPER ──────────────────────
        private async Task<(string key, string url)> UploadFileAsync(
            IFormFile file, string key)
        {
            var bucket = _config["R2:BucketName"]!;

            using var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = bucket,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true,
            };

            await _s3.PutObjectAsync(request);
            return (key, GetPublicUrl(key));
        }
    }
}
