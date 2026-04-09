FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY candidate-service/Vettly.CandidateService.csproj candidate-service/
RUN dotnet restore candidate-service/Vettly.CandidateService.csproj

COPY shared/ shared/
COPY candidate-service/ candidate-service/

WORKDIR /src/candidate-service
RUN dotnet publish Vettly.CandidateService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.CandidateService.dll"]