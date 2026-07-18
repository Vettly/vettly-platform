using System.Text.Json;
using StackExchange.Redis;
using Vettly.Shared.DTOs.Events;

namespace Vettly.JobService.Services;

public class RedisEventPublisher(IConnectionMultiplexer redis, ILogger<RedisEventPublisher> logger)
{
    private const string Channel = "vettly.events";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task PublishAsync<T>(string type, T data)
    {
        try
        {
            var envelope = new DomainEventEnvelope<T> { Type = type, Data = data };
            var json = JsonSerializer.Serialize(envelope, JsonOptions);
            await redis.GetSubscriber().PublishAsync(RedisChannel.Literal(Channel), json);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to publish domain event {Type}", type);
        }
    }
}
