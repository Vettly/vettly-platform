using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Vettly.MessagingService.Data
{
    public class MessagingDbContextFactory : IDesignTimeDbContextFactory<MessagingDbContext>
    {
        public MessagingDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddUserSecrets<MessagingDbContextFactory>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("MessagingDb")
                ?? "Host=localhost;Port=5433;Database=vettly_messaging;Username=postgres;Password=postgres";

            var optionsBuilder = new DbContextOptionsBuilder<MessagingDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new MessagingDbContext(optionsBuilder.Options);
        }
    }
}
