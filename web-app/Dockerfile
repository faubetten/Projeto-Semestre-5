FROM node:18-alpine

WORKDIR /app

# ✅ Apenas variáveis sem valores
ENV MONGODB_URI=""
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
ENV NEXT_PUBLIC_BASE_URL=""
ENV CLOUDINARY_URL=""
ENV CLERK_SECRET_KEY=""
ENV OPENROUTER_API_KEY=""
ENV GROQ_API_KEY=""

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