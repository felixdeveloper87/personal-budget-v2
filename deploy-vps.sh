#!/bin/bash

# Script para deploy (desenvolvimento local ou produção na VPS)
# Uso: 
#   ./deploy-vps.sh dev    - Para desenvolvimento local
#   ./deploy-vps.sh prod   - Para produção na VPS

MODE=${1:-dev}

if [ "$MODE" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🚀 Iniciando deploy de PRODUÇÃO na VPS..."
else
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "🚀 Iniciando ambiente de DESENVOLVIMENTO local..."
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copiando env.example para .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Ajuste as configurações se necessário."
fi

# Parar containers existentes
echo "📦 Parando containers existentes..."
docker-compose -f $COMPOSE_FILE down

# Remover imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker image prune -f

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose -f $COMPOSE_FILE up --build -d

# Verificar status
echo "✅ Verificando status dos containers..."
docker-compose -f $COMPOSE_FILE ps

if [ "$MODE" = "prod" ]; then
    echo "🎉 Deploy de PRODUÇÃO concluído!"
    echo "📊 Backend disponível em: http://sua-vps:8080"
    echo "🗄️  Banco de dados disponível em: http://sua-vps:5432"
    echo ""
    echo "📝 Lembre-se de:"
    echo "1. Configurar firewall para permitir portas 8080 e 5432"
    echo "2. Configurar domínio/SSL se necessário"
    echo "3. Atualizar VITE_API_URL na Vercel com a URL da sua VPS"
else
    echo "🎉 Ambiente de DESENVOLVIMENTO iniciado!"
    echo "🌐 Frontend disponível em: http://localhost:3000"
    echo "📊 Backend disponível em: http://localhost:8080"
    echo "🗄️  Banco de dados disponível em: http://localhost:5432"
    echo ""
    echo "💡 Para parar: docker-compose -f $COMPOSE_FILE down"
fi
