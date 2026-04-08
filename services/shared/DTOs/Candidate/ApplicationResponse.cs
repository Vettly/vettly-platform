using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class ApplicationResponse
    {
        public Guid Id { get; set; }
        public Guid JobId { get; set; }
        public Guid ResumeId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? AiScore { get; set; }
        public bool BiasFlagged { get; set; }
        public decimal? MatchScore { get; set; }
        public DateTime AppliedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
