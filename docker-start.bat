@echo off
echo 🐳 Iniciando Personal Budget com Docker...
echo.

echo 📦 Parando containers existentes...
docker-compose down

echo.
echo 🚀 Iniciando todos os serviços...
docker-compose up --build

echo.
echo ✅ Aplicação iniciada!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8080
echo 🗄️ PostgreSQL: localhost:5432
