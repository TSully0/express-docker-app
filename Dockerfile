# Usa la imagen oficial de Node.js versión 20 como base
FROM node:20
# Establece el directorio de trabajo en /app
WORKDIR /app
# Copia el package.json y package-lock.json
COPY package*.json ./
# Instala las dependencias
RUN npm install --production
# Copia el resto de la aplicación
COPY . .
# Expone el puerto 3000
EXPOSE 3000
# Comando para iniciar la aplicación
CMD ["node", "app.js"]
# Esto es útil en entornos de orquestación como Kubernetes o Docker Compose
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
