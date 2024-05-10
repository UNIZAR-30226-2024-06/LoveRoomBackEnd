# Utilizamos una imagen base de Node.js
FROM node:18.19

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Establecemos las variables de entorno para DATABASE_URL y SECRET
ARG DATABASE_URL
ARG SECRET
ARG PASSWORD
ARG EMAIL
ENV DATABASE_URL=$DATABASE_URL
ENV SECRET=$SECRET
ENV PASSWORD=$PASSWORD
ENV EMAIL=$EMAIL

# Copiamos el archivo package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .

#Compilamos el codigo
RUN npm run build

#Pillamos los ultimos cambios de la BD
RUN npx prisma db pull

#Generamos el cliente de prisma
RUN npx prisma generate

#Creamos el directorio correspondiente a los archivos multimedia
RUN mkdir dist/uploads

# Añadimos el dns de google
RUN echo "nameserver 8.8.8.8" >> /etc/resolv.conf 

# Exponemos el puerto en el que corre la aplicación Node.js
EXPOSE 5000

# Comando para iniciar la aplicación cuando el contenedor se ejecute
CMD ["npm","run","start:prod"]

