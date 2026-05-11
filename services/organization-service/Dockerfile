FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY organization-service/Vettly.OrganizationService.csproj organization-service/
RUN dotnet restore organization-service/Vettly.OrganizationService.csproj

COPY shared/ shared/
COPY organization-service/ organization-service/

WORKDIR /src/organization-service
RUN dotnet publish Vettly.OrganizationService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.OrganizationService.dll"]
