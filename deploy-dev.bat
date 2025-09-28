@echo off
echo 🚀 Iniciando ambiente de DESENVOLVIMENTO local...

REM Verificar se arquivo .env existe
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado!
    echo 📋 Copiando env.example para .env...
    copy env.example .env
    echo ✅ Arquivo .env criado. Ajuste as configurações se necessário.
)

REM Parar containers existentes
echo 📦 Parando containers existentes...
docker-compose -f docker-compose.dev.yml down

REM Construir e iniciar containers
echo 🔨 Construindo e iniciando containers...
docker-compose -f docker-compose.dev.yml up --build -d

REM Verificar status
echo ✅ Verificando status dos containers...
docker-compose -f docker-compose.dev.yml ps

echo.
echo 🎉 Ambiente de DESENVOLVIMENTO iniciado!
echo 🌐 Frontend disponível em: http://localhost:3000
echo 📊 Backend disponível em: http://localhost:8080
echo 🗄️  Banco de dados disponível em: http://localhost:5432
echo.
echo 💡 Para parar: docker-compose -f docker-compose.dev.yml down
pause
