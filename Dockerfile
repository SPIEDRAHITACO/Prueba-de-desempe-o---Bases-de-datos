# Usa una versión ligera de Node.js
FROM node:18-alpine

# Crea la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias PRIMERO (esto evita el error "Failed to solve")
COPY package*.json ./

# Instala las librerías (Express, pg, mongoose, etc.)
RUN npm install

# Copia todo el resto del código (la carpeta src, database, etc.)
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]