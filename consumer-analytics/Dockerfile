# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos necesarios para instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto que utilizará la aplicación
EXPOSE 3001

# Ejecutar el archivo principal
CMD ["node", "consumer-analytics.js"]
