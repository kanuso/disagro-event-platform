# ============ STAGE 1: BUILDER ============
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento de build para la URL de la API
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar (Vite genera dist/)
RUN npm run build

# ============ STAGE 2: NGINX ============
FROM nginx:alpine

# Copiar el build estático a nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la config personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]