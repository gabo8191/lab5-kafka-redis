# Usar una imagen base de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos necesarios
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto (opcional, solo para debug si se necesitara en el futuro)
EXPOSE 8000

# Ejecutar el script principal
CMD ["python", "notifications.py"]
