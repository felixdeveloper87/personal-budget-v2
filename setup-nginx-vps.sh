#!/bin/bash

# Script para configurar nginx na VPS para o Personal Budget
# Execute este script na sua VPS

echo "🔧 Configurando Nginx para Personal Budget..."

# Verificar se o container nginx está rodando
if ! docker ps | grep -q "photomap-nginx"; then
    echo "❌ Container photomap-nginx não está rodando!"
    echo "Execute: docker start photomap-nginx"
    exit 1
fi

# Backup da configuração atual
echo "📋 Fazendo backup da configuração atual..."
docker exec photomap-nginx cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Copiar nova configuração
echo "📝 Aplicando nova configuração..."
docker cp nginx-budget.conf photomap-nginx:/etc/nginx/conf.d/budget.conf

# Testar configuração
echo "🧪 Testando configuração do nginx..."
if docker exec photomap-nginx nginx -t; then
    echo "✅ Configuração válida!"
    
    # Recarregar nginx
    echo "🔄 Recarregando nginx..."
    docker exec photomap-nginx nginx -s reload
    
    echo "🎉 Configuração aplicada com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Configure seu DNS para apontar budget.seudominio.com para o IP da VPS"
    echo "2. Atualize o VITE_API_URL no vercel.json para: https://budget.seudominio.com"
    echo "3. Faça commit e push das alterações"
    echo ""
    echo "🧪 Teste a API:"
    echo "curl http://budget.seudominio.com/api/auth/register"
else
    echo "❌ Configuração inválida! Restaurando backup..."
    docker exec photomap-nginx cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    exit 1
fi
