# Multi-stage build para otimizar o tamanho da imagem
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src

# Testes no build por padrão (mvn verify = test + package). Build rápido local:
#   docker build --build-arg SKIP_TESTS=true ./backend
ARG SKIP_TESTS=false
RUN if [ "$SKIP_TESTS" = "true" ]; then \
      mvn clean package -Dmaven.test.skip=true; \
    else \
      mvn clean verify; \
    fi

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

RUN mkdir -p /app/uploads/household

# Mudar propriedade dos arquivos para o usuário appuser
RUN chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["java", "-jar", "app.jar"]

