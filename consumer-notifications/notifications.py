import os
import smtplib
from email.mime.text import MIMEText
import json
from kafka import KafkaConsumer
from dotenv import load_dotenv

# Cargar las variables del entorno
load_dotenv()

# Configuración de Kafka
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
TOPIC = "movie-selection"

# Configuración de correo electrónico
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


# Función para enviar correos
def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        print(f"Correo enviado a {to_email}")
    except Exception as e:
        print(f"Error enviando correo: {e}")


# Configuración del Consumer de Kafka
consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=[KAFKA_BROKER],
    auto_offset_reset="earliest",
    group_id="notifications-group",
    enable_auto_commit=True,
)

print("Esperando mensajes...")

# Procesar mensajes
for message in consumer:
    try:
        # Decodificar el mensaje recibido
        data = json.loads(message.value.decode("utf-8"))
        username = data["username"]
        age = data["age"]
        parent_email = data["parentEmail"]
        movie = data["movie"]
        timestamp = data["timestamp"]

        print(f"Evento recibido: {data}")

        # Enviar correo si el usuario es menor de edad
        if age < 18:
            email_body = (
                f"Estimado/a,\n\n"
                f"El usuario {username} seleccionó la película '{movie}' el {timestamp}.\n"
                f"Por favor, tome las medidas que considere necesarias.\n\n"
                f"Saludos,\nEl equipo de notificaciones."
            )
            send_email(
                parent_email,
                f"Notificación de película seleccionada: {movie}",
                email_body,
            )
    except Exception as e:
        print(f"Error procesando mensaje: {e}")
