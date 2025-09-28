# 🐘 Configuração do PostgreSQL (DESENVOLVIMENTO LOCAL)

> ⚠️ **ATENÇÃO**: Este arquivo é apenas para desenvolvimento local fora do Docker.
> 
> **Para usar com Docker, veja**: [PROFILES_README.md](./PROFILES_README.md)

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL
- **Windows:** Baixe em https://www.postgresql.org/download/windows/
- **macOS:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql postgresql-contrib`

### 2. Configuração Inicial

#### Windows:
1. Durante a instalação, defina senha para usuário `postgres`
2. Anote a porta (padrão: 5432)

#### macOS/Linux:
```bash
# Iniciar PostgreSQL
sudo service postgresql start

# Criar usuário postgres (se necessário)
sudo -u postgres createuser --interactive
```

### 3. Criar Banco de Dados

```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco
CREATE DATABASE personalbudget;

-- Verificar se foi criado
\l

-- Sair
\q
```

### 4. Configuração da Aplicação

O arquivo `application.properties` já está configurado com:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/personalbudget
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 5. Testar Conexão

```bash
# Rodar a aplicação
mvn spring-boot:run
```

Se tudo estiver correto, você verá:
```
HikariPool-1 - Start completed.
Started PersonalBudgetApplication
```

## 🔧 Troubleshooting

### Erro: "Connection refused"
- Verifique se PostgreSQL está rodando
- Confirme a porta (padrão: 5432)

### Erro: "Authentication failed"
- Verifique usuário e senha
- Teste: `psql -U postgres -h localhost`

### Erro: "Database does not exist"
- Execute: `CREATE DATABASE personalbudget;`

## 📊 Acessar Banco

```bash
# Conectar ao banco
psql -U postgres -d personalbudget

# Ver tabelas
\dt

# Ver dados
SELECT * FROM users;
SELECT * FROM transactions;
```
