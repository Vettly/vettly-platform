using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using Vettly.CandidateService.Data;
using Vettly.CandidateService.Services;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddOpenApi();

builder.Services.AddDbContext<CandidateDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CandidateDb")));

var redisConfig = ConfigurationOptions.Parse(builder.Configuration["Redis:ConnectionString"]!);
redisConfig.AbortOnConnectFail = false;
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConfig));

builder.Services.AddScoped<IS3Service, S3Service>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<RedisEventPublisher>();

builder.Services.AddHttpClient<JobClient>(client =>
{
    var baseUrl = builder.Configuration["JobService:BaseUrl"]
        ?? throw new InvalidOperationException("JobService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddHttpClient<ScreeningClient>(client =>
{
    var baseUrl = builder.Configuration["ScreeningService:BaseUrl"]
        ?? throw new InvalidOperationException("ScreeningService:BaseUrl is not configured");
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

builder.Services.AddMemoryCache();
builder.Services.AddControllers();

var app = builder.Build();

// auto migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<CandidateDbContext>();
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
