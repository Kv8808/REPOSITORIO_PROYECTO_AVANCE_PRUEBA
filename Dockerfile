# Dockerfile (guárdalo como "Dockerfile" en la raíz)
FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json para aprovechar cache de npm
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --production

# Copiar el resto del código
COPY . .

# Exponer puerto (Render inyecta su propio PORT en runtime)
EXPOSE 3000

ENV NODE_ENV=production

# Comando para arrancar la app
CMD ["node", "server.js"]
