# Usar la imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de dependencias y instalar
COPY package*.json ./
RUN npm install

# Copiar el resto del código al contenedor
COPY . .

# Exponer un puerto si el producer tiene una interfaz o lo necesita
EXPOSE 3000

# Comando para ejecutar el productor
CMD ["node", "producer.js"]
