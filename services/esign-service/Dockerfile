FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY shared/Vettly.Shared.csproj shared/
COPY esign-service/Vettly.ESignService.csproj esign-service/
RUN dotnet restore esign-service/Vettly.ESignService.csproj

COPY shared/ shared/
COPY esign-service/ esign-service/

WORKDIR /src/esign-service
RUN dotnet publish Vettly.ESignService.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Vettly.ESignService.dll"]
