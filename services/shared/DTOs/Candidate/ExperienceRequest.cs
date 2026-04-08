using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class ExperienceRequest
    {
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? Description { get; set; }
    }
}
