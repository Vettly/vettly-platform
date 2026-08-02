FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY shared/Vettly.Shared.csproj shared/
COPY auth-service/Vettly.AuthService.csproj auth-service/
RUN dotnet restore auth-service/Vettly.AuthService.csproj

# Copy source and publish directly — no separate build step needed
COPY shared/ shared/
COPY auth-service/ auth-service/

WORKDIR /src/auth-service
RUN dotnet publish Vettly.AuthService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.AuthService.dll"]