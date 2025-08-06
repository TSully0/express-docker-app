# Usa la imagen oficial de Node.js versión 20 como base
FROM node:20
# Establece el directorio de trabajo en /app
WORKDIR /app
# Copia el package.json y package-lock.json
COPY package*.json ./
# Instala las dependencias
RUN npm install
# Copia el resto de la aplicación
COPY . .
# Expone el puerto 3000
EXPOSE 3000
# Comando para iniciar la aplicación
CMD ["node", "app.js"]
