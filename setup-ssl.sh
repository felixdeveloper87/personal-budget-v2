#!/bin/bash

# Script para configurar SSL com Let's Encrypt na VPS
# Execute este script na sua VPS

echo "Configurando SSL com Let's Encrypt..."

# Instalar certbot se não estiver instalado
if ! command -v certbot &> /dev/null; then
    echo "Instalando certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Parar nginx temporariamente
sudo systemctl stop nginx

# Obter certificado SSL (substitua pelo seu domínio real)
echo "Digite seu domínio (ex: budget.seudominio.com):"
read DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "Usando IP como domínio..."
    DOMAIN="91.98.88.120"
fi

# Obter certificado
sudo certbot certonly --standalone -d $DOMAIN

# Configurar nginx com SSL
sudo cp nginx-budget.conf /etc/nginx/sites-available/personal-budget
sudo ln -sf /etc/nginx/sites-available/personal-budget /etc/nginx/sites-enabled/

# Atualizar configuração SSL no nginx
sudo sed -i "s|# ssl_certificate /path/to/your/certificate.crt;|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g" /etc/nginx/sites-available/personal-budget
sudo sed -i "s|# ssl_certificate_key /path/to/your/private.key;|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g" /etc/nginx/sites-available/personal-budget

# Testar configuração
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Configuração válida! Reiniciando nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    echo "SSL configurado com sucesso!"
    echo "Agora você pode usar: https://$DOMAIN/api"
else
    echo "Erro na configuração do nginx. Verifique os logs."
fi

# Configurar renovação automática
echo "Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "Configuração concluída!"
