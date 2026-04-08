using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Vettly.JobService.Data;

public class JobDbContextFactory
    : IDesignTimeDbContextFactory<JobDbContext>
{
    public JobDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<JobDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5433;Database=vettly_jobs;Username=postgres;Password=root");
        return new JobDbContext(optionsBuilder.Build());
    }
}