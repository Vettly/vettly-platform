FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY messaging-service/Vettly.MessagingService.csproj messaging-service/
RUN dotnet restore messaging-service/Vettly.MessagingService.csproj

COPY shared/ shared/
COPY messaging-service/ messaging-service/

WORKDIR /src/messaging-service
RUN dotnet publish Vettly.MessagingService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.MessagingService.dll"]
