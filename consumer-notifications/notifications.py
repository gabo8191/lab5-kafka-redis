from confluent_kafka import Consumer, KafkaException
import smtplib
from email.mime.text import MIMEText
import json

# Configuración del consumidor de Kafka
consumer_config = {
    'bootstrap.servers': 'localhost:9092',  # Cambia esto según tu configuración
    'group.id': 'notifications-group',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(consumer_config)

# Suscribirse al tema
topic = 'movie-selection'
consumer.subscribe([topic])

# Función para enviar correos
def send_email(parent_email, username, age, movie):
    sender_email = "brunocamachosegundo@gmail.com"  # Cambia a tu correo
    sender_password = "pxrl rlht coca eikd"     # Cambia a tu contraseña

    # Contenido del correo
    subject = f"Alerta: Usuario menor viendo contenido"
    body = f"""
    Hola,

    El usuario '{username}', de {age} años, ha accedido a la película '{movie}'.

    Por favor, monitoree esta actividad si es necesario.

    Saludos,
    Equipo de Notificaciones
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = parent_email

    # Enviar el correo
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, parent_email, msg.as_string())
        print(f"Correo enviado a {parent_email}")
    except Exception as e:
        print(f"Error al enviar correo: {e}")

# Consumiendo mensajes de Kafka
try:
    print("Iniciando consumidor de notificaciones...")
    while True:
        msg = consumer.poll(1.0)  # Espera hasta 1 segundo para recibir mensajes
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaException._PARTITION_EOF:
                # Fin de la partición
                continue
            else:
                print(f"Error en el consumidor: {msg.error()}")
                break

        # Procesar el mensaje recibido
        try:
            data = json.loads(msg.value().decode('utf-8'))  # Decodificar mensaje
            username = data.get('username')
            age = int(data.get('age'))
            parent_email = data.get('parentEmail')
            movie = data.get('movie')

            # Verificar datos
            if not all([username, age, movie]):
                print("Mensaje inválido, faltan campos requeridos.")
                continue

            # Lógica para menores de edad
            if age < 18 and parent_email:
                send_email(parent_email, username, age, movie)
            else:
                print(f"Usuario {username} con {age} años no requiere notificación.")

        except Exception as e:
            print(f"Error procesando el mensaje: {e}")

except KeyboardInterrupt:
    print("Deteniendo consumidor...")

finally:
    consumer.close()
