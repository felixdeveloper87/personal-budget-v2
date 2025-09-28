@echo off
echo 🐳 Iniciando Personal Budget em modo PRODUÇÃO (sem override)...
echo.

echo 📦 Parando containers existentes...
docker-compose down

echo.
echo 🚀 Iniciando apenas com docker-compose.yml...
docker-compose -f docker-compose.yml up --build

echo.
echo ✅ Aplicação iniciada!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8080
echo 🗄️ PostgreSQL: localhost:5432
