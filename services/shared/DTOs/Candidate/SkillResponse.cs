using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class SkillResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Level { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
