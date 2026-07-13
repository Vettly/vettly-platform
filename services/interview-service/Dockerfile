FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y libkrb5-3 libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY interview-service/Vettly.InterviewService.csproj interview-service/
RUN dotnet restore interview-service/Vettly.InterviewService.csproj

COPY shared/ shared/
COPY interview-service/ interview-service/

WORKDIR /src/interview-service
RUN dotnet publish Vettly.InterviewService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.InterviewService.dll"]
