# Utilizamos una imagen base de Node.js
FROM node:18.19

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Establecemos las variables de entorno para DATABASE_URL y SECRET
ARG DATABASE_URL
ARG SECRET
ARG PASSWORD
ARG EMAIL
ARG BRAINTREE_MERCHANT_ID
ARG BRAINTREE_PUBLIC_KEY
ARG BRAINTREE_PRIVATE_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV SECRET=$SECRET
ENV PASSWORD=$PASSWORD
ENV EMAIL=$EMAIL
ENV BRAINTREE_MERCHANT_ID=$BRAINTREE_MERCHANT_ID
ENV BRAINTREE_PUBLIC_KEY=$BRAINTREE_PUBLIC_KEY 
ENV BRAINTREE_PRIVATE_KEY=$BRAINTREE_PRIVATE_KEY

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

# Cambia el user a root
USER root

# Exponemos el puerto en el que corre la aplicación Node.js
EXPOSE 5000

# Comando para iniciar la aplicación cuando el contenedor se ejecute y añadir el DNS de google para la funcion de envio de correos
CMD ["sh", "-c", "echo 'nameserver 8.8.8.8\nnameserver 150.171.10.37\nnameserver 168.63.129.16\nsearch ww5ffwxs2zkurf4islfajchhfh.bx.internal.cloudapp.net' > /etc/resolv.conf && npm run start:prod"]
#CMD ["npm","run","start:prod"]
