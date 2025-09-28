# 🔧 Configuração Simplificada

## 📋 Estrutura Atual

### 🐳 **Docker (Padrão)**
- **Arquivo**: `application.properties`
- **Banco**: PostgreSQL no Docker (`db:5432`)
- **Uso**: `docker-compose up --build`

### 💻 **Desenvolvimento Local (Opcional)**
- **Arquivo**: `application.properties` (mesmo arquivo)
- **Banco**: PostgreSQL local (`localhost:5432`)
- **Uso**: Configurar variáveis de ambiente locais

## 🚀 Como Usar

### Para Docker (Recomendado):
```bash
# Simples e direto
docker-compose up --build
```

### Para Desenvolvimento Local:
```bash
# 1. Instalar PostgreSQL localmente
# 2. Criar banco: CREATE DATABASE personalbudget;
# 3. Configurar variáveis de ambiente
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=personalbudget
export DB_USER=postgres
export DB_PASSWORD=postgres

# 4. Rodar aplicação
mvn spring-boot:run
```

## ✅ Vantagens

- **1 arquivo apenas** - Menos confusão
- **Configuração única** - Fácil de manter
- **Variáveis de ambiente** - Flexível para diferentes ambientes
