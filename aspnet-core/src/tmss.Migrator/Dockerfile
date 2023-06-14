#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["src/tmss.Migrator/tmss.Migrator.csproj", "src/tmss.Migrator/"]
COPY ["src/tmss.EntityFrameworkCore/tmss.EntityFrameworkCore.csproj", "src/tmss.EntityFrameworkCore/"]
COPY ["src/tmss.Core/tmss.Core.csproj", "src/tmss.Core/"]
COPY ["src/tmss.Core.Shared/tmss.Core.Shared.csproj", "src/tmss.Core.Shared/"]
RUN dotnet restore "src/tmss.Migrator/tmss.Migrator.csproj"
COPY . .
WORKDIR "/src/src/tmss.Migrator"
RUN dotnet build "tmss.Migrator.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "tmss.Migrator.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "tmss.Migrator.dll"]
