# 🚀 Personal Budget - Deploy e Desenvolvimento

Este projeto está configurado para funcionar tanto em **desenvolvimento local** quanto em **produção** usando os mesmos arquivos de configuração.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Git

## 🛠️ Configuração Inicial

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/personal-budget-v2.git
   cd personal-budget-v2
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   # Copie o arquivo de exemplo
   cp env.example .env
   
   # Edite o arquivo .env com suas configurações
   # Para desenvolvimento local, você pode deixar os valores padrão
   ```

## 🏠 Desenvolvimento Local

### Windows:
```bash
# Iniciar ambiente de desenvolvimento
deploy-dev.bat

# Parar ambiente
docker-compose -f docker-compose.dev.yml down
```

### Linux/Mac:
```bash
# Iniciar ambiente de desenvolvimento
./deploy-vps.sh dev

# Parar ambiente
docker-compose -f docker-compose.dev.yml down
```

### Acessos:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Banco de dados**: localhost:5432

## 🌐 Produção na VPS

### 1. Configure a VPS:
```bash
# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl start docker
sudo usermod -aG docker $USER

# Clonar repositório
git clone https://github.com/seu-usuario/personal-budget-v2.git
cd personal-budget-v2
```

### 2. Configure as variáveis de ambiente:
```bash
# Edite o arquivo .env com as configurações de produção
nano .env
```

### 3. Deploy:

#### Windows:
```bash
deploy-prod.bat
```

#### Linux/Mac:
```bash
./deploy-vps.sh prod
```

### 4. Configure o firewall:
```bash
sudo ufw allow 8080  # Backend
sudo ufw allow 5432  # PostgreSQL (opcional)
sudo ufw enable
```

## ☁️ Frontend na Vercel

### 1. Conecte o repositório na Vercel

### 2. Configure a variável de ambiente:
- **Nome**: `VITE_API_URL`
- **Valor**: `https://sua-vps.com:8080` (URL da sua VPS)

### 3. Deploy automático!

## 📁 Estrutura de Arquivos

```
personal-budget-v2/
├── .env                    # Variáveis de ambiente (criar a partir do env.example)
├── env.example            # Exemplo de variáveis de ambiente
├── docker-compose.yml     # Configuração principal (desenvolvimento)
├── docker-compose.dev.yml # Configuração de desenvolvimento
├── docker-compose.prod.yml # Configuração de produção
├── deploy-vps.sh          # Script de deploy (Linux/Mac)
├── deploy-dev.bat         # Script de desenvolvimento (Windows)
├── deploy-prod.bat        # Script de produção (Windows)
├── VERCEL_CONFIG.md       # Configuração da Vercel
├── VPS_SETUP.md          # Configuração da VPS
└── README_DEPLOY.md      # Este arquivo
```

## 🔧 Variáveis de Ambiente

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `DB_NAME` | personalbudget | personalbudget | Nome do banco de dados |
| `DB_USER` | postgres | postgres | Usuário do banco |
| `DB_PASSWORD` | postgres | sua_senha_segura | Senha do banco |
| `JWT_SECRET` | padrão | sua_chave_segura | Chave secreta JWT |
| `JWT_EXPIRATION` | 86400000 | 86400000 | Expiração do token (ms) |
| `VITE_API_URL` | (vazio) | https://sua-vps.com:8080 | URL da API |

## 🐛 Troubleshooting

### Problema: "Arquivo .env não encontrado"
**Solução**: Execute `cp env.example .env` e configure as variáveis.

### Problema: "Porta já em uso"
**Solução**: Pare os containers com `docker-compose down` e tente novamente.

### Problema: "CORS error" no frontend
**Solução**: Verifique se a URL da API está correta na variável `VITE_API_URL`.

### Problema: "Banco de dados não conecta"
**Solução**: Verifique se as variáveis `DB_*` estão corretas no arquivo `.env`.

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se o Docker está rodando
2. Se as portas 3000, 8080 e 5432 estão livres
3. Se o arquivo `.env` está configurado corretamente
4. Se o firewall permite as conexões necessárias

## 🎉 Pronto!

Agora você tem um ambiente completo que funciona tanto para desenvolvimento quanto para produção! 🚀
