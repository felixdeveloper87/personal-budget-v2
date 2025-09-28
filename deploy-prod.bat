@echo off
echo 🚀 Iniciando deploy de PRODUÇÃO na VPS...

REM Verificar se arquivo .env existe
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado!
    echo 📋 Copiando env.example para .env...
    copy env.example .env
    echo ✅ Arquivo .env criado. Ajuste as configurações se necessário.
)

REM Parar containers existentes
echo 📦 Parando containers existentes...
docker-compose -f docker-compose.prod.yml down

REM Construir e iniciar containers
echo 🔨 Construindo e iniciando containers...
docker-compose -f docker-compose.prod.yml up --build -d

REM Verificar status
echo ✅ Verificando status dos containers...
docker-compose -f docker-compose.prod.yml ps

echo.
echo 🎉 Deploy de PRODUÇÃO concluído!
echo 📊 Backend disponível em: http://sua-vps:8080
echo 🗄️  Banco de dados disponível em: http://sua-vps:5432
echo.
echo 📝 Lembre-se de:
echo 1. Configurar firewall para permitir portas 8080 e 5432
echo 2. Configurar domínio/SSL se necessário
echo 3. Atualizar VITE_API_URL na Vercel com a URL da sua VPS
pause
