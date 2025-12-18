FROM node:18-alpine

WORKDIR /app

# Copiar package files primeiro para melhor cache
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "dev"]