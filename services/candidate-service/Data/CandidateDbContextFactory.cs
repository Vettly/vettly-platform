using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Vettly.CandidateService.Data
{
    public class CandidateDbContextFactory : IDesignTimeDbContextFactory<CandidateDbContext>
    {
        public CandidateDbContext CreateDbContext(string[] args)
        {
            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddUserSecrets<CandidateDbContextFactory>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("CandidateDb");
            
            var optionsBuilder = new DbContextOptionsBuilder<CandidateDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new CandidateDbContext(optionsBuilder.Options);
        }
    }
}
