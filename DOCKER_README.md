# Personal Budget - Docker Setup

Este projeto está configurado para rodar com Docker Compose, incluindo:
- Backend Spring Boot (Java 17)
- Frontend React/Vite (Node.js 18)
- Banco de dados PostgreSQL 16

## Estrutura dos Arquivos Docker

```
├── docker-compose.yml          # Configuração principal
├── docker-compose.override.yml # Override para desenvolvimento
├── backend/
│   └── Dockerfile              # Imagem do backend
├── frontend/
│   ├── Dockerfile              # Imagem de produção do frontend
│   └── Dockerfile.dev          # Imagem de desenvolvimento do frontend
```

## Como Usar

### 1. Produção
Para rodar em modo de produção (com build otimizado):

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

### 2. Desenvolvimento
Para desenvolvimento com hot-reload:

```bash
# Usar o arquivo de override para desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### 3. Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Ver logs de um serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Acessar container do backend
docker-compose exec backend bash

# Acessar container do frontend
docker-compose exec frontend sh

# Reconstruir apenas um serviço
docker-compose up --build backend
```

## Portas

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Banco de dados**: localhost:5432

## Variáveis de Ambiente

As seguintes variáveis estão configuradas no docker-compose.yml:

- `POSTGRES_DB`: personalbudget
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: postgres
- `SPRING_PROFILES_ACTIVE`: prod (ou dev para desenvolvimento)
- `DB_HOST`: db (nome do serviço no Docker)

## Estrutura dos Serviços

### Backend (Spring Boot)
- **Porta**: 8080
- **Perfil**: prod (produção) ou dev (desenvolvimento)
- **Banco**: Conecta automaticamente ao PostgreSQL
- **Health Check**: Aguarda o banco estar pronto antes de iniciar

### Frontend (React/Vite)
- **Porta**: 3000 (produção) ou 5173 (desenvolvimento)
- **Build**: Otimizado para produção com Nginx
- **Dev**: Hot-reload habilitado

### Banco de Dados (PostgreSQL)
- **Porta**: 5432
- **Volume**: Dados persistem em `dbdata`
- **Health Check**: Verifica se está pronto para conexões

## Troubleshooting

### Problema: Backend não consegue conectar ao banco
- Verifique se o banco está rodando: `docker-compose logs db`
- Aguarde o health check do banco completar

### Problema: Frontend não carrega
- Verifique se o build foi bem-sucedido: `docker-compose logs frontend`
- Acesse http://localhost:3000

### Problema: Porta já em uso
- Pare outros serviços que usam as portas 3000, 8080 ou 5432
- Ou altere as portas no docker-compose.yml

### Limpar tudo e começar do zero
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

