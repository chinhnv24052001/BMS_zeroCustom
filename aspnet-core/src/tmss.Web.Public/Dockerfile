#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["src/tmss.Web.Public/tmss.Web.Public.csproj", "src/tmss.Web.Public/"]
COPY ["src/tmss.Web.Core/tmss.Web.Core.csproj", "src/tmss.Web.Core/"]
COPY ["src/tmss.Application/tmss.Application.csproj", "src/tmss.Application/"]
COPY ["src/tmss.Application.Shared/tmss.Application.Shared.csproj", "src/tmss.Application.Shared/"]
COPY ["src/tmss.Core.Shared/tmss.Core.Shared.csproj", "src/tmss.Core.Shared/"]
COPY ["src/tmss.Core/tmss.Core.csproj", "src/tmss.Core/"]
COPY ["src/tmss.EntityFrameworkCore/tmss.EntityFrameworkCore.csproj", "src/tmss.EntityFrameworkCore/"]
COPY ["src/tmss.GraphQL/tmss.GraphQL.csproj", "src/tmss.GraphQL/"]
RUN dotnet restore "src/tmss.Web.Public/tmss.Web.Public.csproj"
COPY . .
WORKDIR "/src/src/tmss.Web.Public"
RUN dotnet build "tmss.Web.Public.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "tmss.Web.Public.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "tmss.Web.Public.dll"]
