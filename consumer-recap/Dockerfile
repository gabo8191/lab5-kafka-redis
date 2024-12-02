# Usar la imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de dependencias y configuraciones
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de la API REST
EXPOSE 3000

# Comando para ejecutar el consumer recap
CMD ["node", "consumer-recap.js"]
