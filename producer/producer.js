const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Configuración de Kafka
const kafka = new Kafka({
  clientId: 'movie-app',
  brokers: [process.env.KAFKA_BROKER]
});
const producer = kafka.producer();

(async () => {
  try {
    await producer.connect();
    console.log('Producer conectado a Kafka');
  } catch (error) {
    console.error('Error al conectar el producer a Kafka:', error);
  }
})();

app.use(bodyParser.json());
app.use(express.static('public'));

// Validación del correo
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/produce', async (req, res) => {
  const { username, age, parentEmail, movie, timestamp } = req.body;

  if (!username || !age || !movie || !timestamp) {
    return res.status(400).json({ error: 'Faltan datos obligatorios en el evento.' });
  }

  if (age < 18 && (!parentEmail || !isValidEmail(parentEmail))) {
    return res.status(400).json({ error: 'El correo electrónico de los padres es obligatorio y debe ser válido.' });
  }

  try {
    await producer.send({
      topic: 'movie-selection',
      messages: [{ value: JSON.stringify({ username, age, parentEmail, movie, timestamp }) }],
    });
    console.log('Evento enviado:', { username, movie });
    res.status(200).json({ message: 'Evento enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el evento a Kafka:', error);
    res.status(500).json({ error: 'Error al enviar el evento' });
  }
});

// Simulación de un catálogo de películas (en un caso real, se podría obtener de una base de datos)
const movies = [
  { title: 'Inception', image: '/images/inception.jpg' },
  { title: 'Interstellar', image: '/images/interstellar.jpg' },
  { title: 'The Dark Knight', image: '/images/dark_knight.jpg' },
];

app.get('/movies', (req, res) => {
  res.json(movies);
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
