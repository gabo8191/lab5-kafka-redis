require('dotenv').config();
const { Kafka } = require('kafkajs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Cambio aquí: usamos require('socket.io') en vez de destructuración

// Configuración de Kafka
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
const consumer = kafka.consumer({ groupId: 'analytics-group' });

// Configuración de la aplicación Express
const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server); // Corregido: en vez de new Server(), usamos socketIo(server)

const movieViews = {};

io.on('connection', (socket) => {
  console.log('Cliente conectado para analytics.');
  socket.emit('top10', Object.entries(movieViews).sort((a, b) => b[1] - a[1]).slice(0, 10));
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'movie-selection', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { movie } = JSON.parse(message.value.toString());
      movieViews[movie] = (movieViews[movie] || 0) + 1;

      io.emit('top10', Object.entries(movieViews).sort((a, b) => b[1] - a[1]).slice(0, 10));
    },
  });
})();

server.listen(process.env.PORT, () => console.log(`Analytics en tiempo real en http://localhost:${process.env.PORT}`));
