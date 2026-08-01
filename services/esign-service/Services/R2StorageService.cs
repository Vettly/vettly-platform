using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace Vettly.ESignService.Services
{
    public class R2StorageService : IR2StorageService
    {
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _config;

        public R2StorageService(IConfiguration config)
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

        public async Task UploadPdfAsync(string key, byte[] bytes)
        {
            var bucket = _config["R2:BucketName"]!;
            using var stream = new MemoryStream(bytes);

            var request = new PutObjectRequest
            {
                BucketName = bucket,
                Key = key,
                InputStream = stream,
                ContentType = "application/pdf",
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true,
            };

            await _s3.PutObjectAsync(request);
        }

        public string GetPublicUrl(string key)
        {
            var publicUrl = _config["R2:PublicUrl"];

            if (!string.IsNullOrEmpty(publicUrl))
                return $"{publicUrl}/{key}";

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _config["R2:BucketName"]!,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddHours(1),
            };
            return _s3.GetPreSignedURL(request);
        }
    }
}
