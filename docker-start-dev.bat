@echo off
echo 🐳 Iniciando Personal Budget em modo DESENVOLVIMENTO...
echo.

echo 📦 Parando containers existentes...
docker-compose -f docker-compose.dev.yml down

echo.
echo 🚀 Iniciando todos os serviços com HOT RELOAD...
docker-compose -f docker-compose.dev.yml up --build

echo.
echo ✅ Aplicação iniciada em modo desenvolvimento!
echo 🌐 Frontend: http://localhost:3000 (com hot reload)
echo 🔧 Backend: http://localhost:8080
echo 🗄️ PostgreSQL: localhost:5432
