# Configuração para Deploy na Vercel

## Variáveis de Ambiente na Vercel

Para configurar o frontend na Vercel, você precisa adicionar as seguintes variáveis de ambiente:

### 1. VITE_API_URL
- **Valor**: URL completa do seu backend na VPS
- **Exemplo**: `https://sua-vps.com:8080` ou `https://api.seudominio.com`
- **Descrição**: URL onde o backend Spring Boot está rodando na sua VPS

### Como configurar na Vercel:

1. Acesse o dashboard da Vercel
2. Vá para o seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione a variável:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://sua-vps.com:8080` (substitua pela URL da sua VPS)
   - **Environment**: Production (e Preview se quiser)

## Desenvolvimento Local

Para desenvolvimento local, você pode usar:

### Windows:
```bash
# Desenvolvimento
deploy-dev.bat

# Produção
deploy-prod.bat
```

### Linux/Mac:
```bash
# Desenvolvimento
./deploy-vps.sh dev

# Produção
./deploy-vps.sh prod
```

### Configuração do Backend na VPS

Para o backend na VPS, você precisará configurar no arquivo `.env`:

```bash
# Banco de dados
DB_NAME=personalbudget
DB_USER=postgres
DB_PASSWORD=seu_password_super_seguro_aqui

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_de_pelo_menos_256_bits_aqui
JWT_EXPIRATION=86400000

# Frontend (apenas para produção)
VITE_API_URL=https://sua-vps.com:8080
```

### CORS no Backend

O backend já está configurado para aceitar requisições da Vercel e desenvolvimento local.

### Exemplo de URL completa:
- Frontend: `https://personal-budget.vercel.app`
- Backend: `https://api.seudominio.com` ou `https://sua-vps.com:8080`
