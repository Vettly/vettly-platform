namespace Vettly.JobService.Models
{
    public class JobPosting
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid JobId { get; set; }
       public string Name { get; set; } = string.Empty;
        public bool IsRequired { get; set; } = true;

        public JobPosting Job { get; set; } = null!;
    }
}