using System.Text.Json;
using StackExchange.Redis;
using Vettly.MessagingService.Models;
using Vettly.Shared.DTOs.Events;

namespace Vettly.MessagingService.Services;

public class RedisEventSubscriber(
    IConnectionMultiplexer redis,
    IServiceScopeFactory scopeFactory,
    ILogger<RedisEventSubscriber> logger) : BackgroundService
{
    private const string Channel = "vettly.events";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var subscriber = redis.GetSubscriber();
        await subscriber.SubscribeAsync(RedisChannel.Literal(Channel), async (_, message) =>
        {
            try
            {
                await HandleAsync(message.ToString());
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to handle domain event: {Message}", message);
            }
        });

        // the subscription callback above does the real work; just keep the host alive until shutdown
        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // expected on shutdown
        }
    }

    private async Task HandleAsync(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var type = doc.RootElement.GetProperty("type").GetString();
        if (type is null) return;

        using var scope = scopeFactory.CreateScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var candidateClient = scope.ServiceProvider.GetRequiredService<CandidateServiceClient>();

        switch (type)
        {
            case DomainEventTypes.ApplicationReceived:
            {
                var data = doc.RootElement.GetProperty("data").Deserialize<ApplicationReceivedEvent>(JsonOptions);
                if (data is null) return;

                var job = await scope.ServiceProvider.GetRequiredService<JobServiceClient>().GetJobAsync(data.JobId);
                if (job is null) return;

                await notificationService.CreateAsync(
                    job.RecruiterId,
                    NotificationType.ApplicationReceived,
                    $"New application from {data.CandidateName}",
                    job.Title,
                    data.JobId,
                    data.ApplicationId);
                break;
            }
            case DomainEventTypes.StageChanged:
            {
                var data = doc.RootElement.GetProperty("data").Deserialize<StageChangedEvent>(JsonOptions);
                if (data is null || data.Stage == "applied") return;

                var participants = await candidateClient.GetApplicationParticipantsAsync(data.ApplicationId);
                if (participants is null) return;

                await notificationService.CreateAsync(
                    participants.CandidateUserId,
                    NotificationType.StageChanged,
                    $"You were moved to {data.Stage}",
                    data.JobTitle,
                    data.JobId,
                    data.ApplicationId);
                break;
            }
            case DomainEventTypes.OfferReady:
            {
                var data = doc.RootElement.GetProperty("data").Deserialize<OfferReadyEvent>(JsonOptions);
                if (data is null) return;

                await notificationService.CreateAsync(
                    data.CandidateUserId,
                    NotificationType.OfferReady,
                    "Your offer letter is ready to sign",
                    data.JobTitle,
                    data.JobId,
                    data.ApplicationId);
                break;
            }
            case DomainEventTypes.DocumentSigned:
            {
                var data = doc.RootElement.GetProperty("data").Deserialize<DocumentSignedEvent>(JsonOptions);
                if (data is null) return;

                await notificationService.CreateAsync(
                    data.RecruiterUserId,
                    NotificationType.DocumentSigned,
                    $"{data.CandidateName} accepted the offer",
                    data.JobTitle,
                    data.JobId,
                    data.ApplicationId);
                break;
            }
        }
    }
}
