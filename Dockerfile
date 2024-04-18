# Fase de construcción: Instalar dependencias y compilar TypeScript
FROM node:latest AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración
COPY package.json package-lock.json tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Fase de producción: Servir la aplicación con Nginx
FROM nginx:latest

# Copiar los archivos de configuración de Nginx y los certificados SSL/TLS
COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/server.crt /etc/nginx/server.crt
COPY certs/server.key /etc/nginx/server.key

# Copiar el código compilado de la aplicación desde la fase de construcción
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer los puertos 80 y 443 para HTTP y HTTPS respectivamente
EXPOSE 80
EXPOSE 443

# Iniciar Nginx y tu servidor Node.js usando un script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]

