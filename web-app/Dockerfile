FROM node:18-alpine

WORKDIR /app

# ⚠️ APENAS ISSA ⚠️
ENV NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

CMD ["npm", "start"]