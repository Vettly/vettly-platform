FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY job-service/Vettly.JobService.csproj job-service/
RUN dotnet restore job-service/Vettly.JobService.csproj

COPY shared/ shared/
COPY job-service/ job-service/

WORKDIR /src/job-service
RUN dotnet publish Vettly.JobService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.JobService.dll"]