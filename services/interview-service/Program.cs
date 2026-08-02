using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Vettly.InterviewService.Data;
using Vettly.InterviewService.Services;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddOpenApi();

// PostgreSQL
builder.Services.AddDbContext<InterviewDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("InterviewDb")));

// JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings["Issuer"],
            ValidAudience            = jwtSettings["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
        };
    });

// CORS
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

// HTTP clients
builder.Services.AddHttpClient<CandidateClient>(client =>
{
    var baseUrl = builder.Configuration["CandidateService:BaseUrl"]
        ?? throw new InvalidOperationException("CandidateService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddHttpClient<JobClient>(client =>
{
    var baseUrl = builder.Configuration["JobService:BaseUrl"]
        ?? throw new InvalidOperationException("JobService:BaseUrl is not configured");
    client.BaseAddress = new Uri(baseUrl);
});

// Services
builder.Services.AddScoped<IInterviewService, InterviewService>();

builder.Services.AddControllers();

var app = builder.Build();

// auto migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InterviewDbContext>();
    db.Database.Migrate();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapOpenApi();
app.UseCors("VettlyWeb");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
