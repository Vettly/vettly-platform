using System;
using System.Collections.Generic;
using System.Text;

namespace Vettly.Shared.DTOs.Candidate
{
    public class CreateApplicationRequest
    {
        public Guid JobId { get; set; }
        public Guid ResumeId { get; set; }
    }
}
