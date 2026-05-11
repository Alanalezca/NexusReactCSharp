# -------------------------
# 1. Build du frontend React
# -------------------------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# -------------------------
# 2. Build du backend .NET
# -------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /app

COPY backend/NexusNet.Api/*.csproj ./backend/NexusNet.Api/
RUN dotnet restore ./backend/NexusNet.Api/NexusNet.Api.csproj

COPY backend/ ./backend/

# On copie le build React dans wwwroot du backend
COPY --from=frontend-build /app/frontend/dist ./backend/NexusNet.Api/wwwroot

RUN dotnet publish ./backend/NexusNet.Api/NexusNet.Api.csproj -c Release -o /app/publish


# -------------------------
# 3. Image finale utilisée en production
# -------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=backend-build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "NexusNet.Api.dll"]