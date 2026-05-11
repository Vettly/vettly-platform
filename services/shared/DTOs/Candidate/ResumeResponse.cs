using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class ResumeResponse
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string S3Url { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
