# Configuração da VPS

## 1. Preparação da VPS

### Instalar Docker e Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Logout e login novamente para aplicar as permissões
```

### Clonar o repositório
```bash
git clone https://github.com/seu-usuario/personal-budget-v2.git
cd personal-budget-v2
```

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de dados
DB_NAME=personalbudget
DB_USER=postgres
DB_PASSWORD=seu_password_super_seguro_aqui

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_de_pelo_menos_256_bits_aqui
JWT_EXPIRATION=86400000

# Perfil do Spring
SPRING_PROFILES_ACTIVE=prod
```

## 3. Deploy

```bash
# Tornar o script executável
chmod +x deploy-vps.sh

# Executar deploy
./deploy-vps.sh
```

## 4. Configurar Firewall

```bash
# Permitir portas necessárias
sudo ufw allow 8080  # Backend
sudo ufw allow 5432  # PostgreSQL (opcional, apenas se precisar acessar externamente)
sudo ufw allow 22    # SSH
sudo ufw enable
```

## 5. Configurar Domínio (Opcional)

Se você tem um domínio, configure um proxy reverso com Nginx:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. SSL com Let's Encrypt (Opcional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

## 7. Verificar Deploy

```bash
# Verificar containers
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Testar API
curl http://sua-vps:8080/api/auth/health
```

## 8. Configurar Vercel

Na Vercel, adicione a variável de ambiente:
- **VITE_API_URL**: `https://sua-vps:8080` ou `https://api.seudominio.com`
