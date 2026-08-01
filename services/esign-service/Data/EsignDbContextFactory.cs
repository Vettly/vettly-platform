using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Vettly.ESignService.Data
{
    public class EsignDbContextFactory : IDesignTimeDbContextFactory<EsignDbContext>
    {
        public EsignDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddUserSecrets<EsignDbContextFactory>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("EsignDb")
                ?? "Host=localhost;Port=5433;Database=vettly_esign;Username=postgres;Password=postgres";

            var optionsBuilder = new DbContextOptionsBuilder<EsignDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new EsignDbContext(optionsBuilder.Options);
        }
    }
}
