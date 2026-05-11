using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class SkillRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Level { get; set; }
    }
}
