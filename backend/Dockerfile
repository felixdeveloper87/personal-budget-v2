# Multi-stage build para otimizar o tamanho da imagem
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY pom.xml .
COPY src ./src

# Baixar dependências e compilar o projeto
RUN mvn clean package -DskipTests

# Verificar se o JAR foi criado
RUN ls -la target/

# Imagem final
FROM eclipse-temurin:17-jre

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Definir diretório de trabalho
WORKDIR /app

# Copiar o JAR compilado
COPY --from=build /app/target/*.jar app.jar

# Mudar propriedade dos arquivos para o usuário appuser
RUN chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8080

# Configurar variáveis de ambiente
ENV DB_HOST=db
ENV DB_PORT=5432
ENV DB_NAME=personalbudget
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres

# Comando para iniciar a aplicação
CMD ["java", "-jar", "app.jar"]

