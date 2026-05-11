# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar dependências (ou npm ci após correr npm install e commitar package-lock.json)
RUN npm install

# Copiar código fonte
COPY . .

# Vite embute import.meta.env no build — definir antes de npm run build
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_API_URL=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL

# Construir a aplicação
RUN npm run build

# Imagem final com nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copiar arquivos construídos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]

