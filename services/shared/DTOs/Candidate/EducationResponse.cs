using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class EducationResponse
    {
        public Guid Id { get; set; }
        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public string Field { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public decimal? Gpa { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
