using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using StackExchange.Redis;
using System.Text;
using Vettly.ESignService.Data;
using Vettly.ESignService.Services;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddOpenApi();

builder.Services.AddDbContext<EsignDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("EsignDb")));

var redisConfig = ConfigurationOptions.Parse(builder.Configuration["Redis:ConnectionString"]!);
redisConfig.AbortOnConnectFail = false;
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConfig));

builder.Services.AddScoped<IR2StorageService, R2StorageService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ParticipantResolver>();
builder.Services.AddScoped<RedisEventPublisher>();

builder.Services.AddHttpClient<JobServiceClient>(client =>
{
    var baseUrl = builder.Configuration["JobService:BaseUrl"]
        ?? throw new InvalidOperationException("JobService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddHttpClient<CandidateServiceClient>(client =>
{
    var baseUrl = builder.Configuration["CandidateService:BaseUrl"]
        ?? throw new InvalidOperationException("CandidateService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddHttpClient<AuthServiceClient>(client =>
{
    var baseUrl = builder.Configuration["AuthService:BaseUrl"]
        ?? throw new InvalidOperationException("AuthService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
        };
    });

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("VettlyWeb", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EsignDbContext>();
    db.Database.Migrate();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.UseCors("VettlyWeb");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

await app.RunAsync();
