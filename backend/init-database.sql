-- Script para criar o banco de dados PersonalBudget
-- Execute este script no PostgreSQL antes de rodar a aplicação

-- Criar banco de dados (se não existir)
CREATE DATABASE personalbudget;

-- Conectar ao banco personalbudget
\c personalbudget;

-- Criar usuário postgres (se não existir)
-- CREATE USER postgres WITH PASSWORD 'postgres';
-- ALTER USER postgres CREATEDB;
-- GRANT ALL PRIVILEGES ON DATABASE personalbudget TO postgres;

-- As tabelas serão criadas automaticamente pelo Hibernate
-- quando a aplicação Spring Boot iniciar
