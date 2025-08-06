# Usa una imagen oficial de Node
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia primero package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias dentro del contenedor
RUN npm install

# Copia el resto del código de la app
COPY . .

# Expone el puerto que tu app usa (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando para ejecutar la app
CMD [ "node", "app.js" ]


