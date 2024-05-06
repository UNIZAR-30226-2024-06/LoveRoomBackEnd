# Utilizamos una imagen base de Node.js
FROM node:18.19

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Establecemos las variables de entorno para DATABASE_URL y SECRET
ARG DATABASE_URL
ARG SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV SECRET=$SECRET

# Copiamos el archivo package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .
#Creamos el directorio correspondiente a los archivos multimedia
RUN mkdir src/uploads

#Compilamos el codigo
RUN npm run build

#Pillamos los ultimos cambios de la BD
RUN npx prisma db pull

#Generamos el cliente de prisma
RUN npx prisma generate

# Exponemos el puerto en el que corre la aplicación Node.js
EXPOSE 5000

# Comando para iniciar la aplicación cuando el contenedor se ejecute
CMD ["npm","run","start:prod"]

