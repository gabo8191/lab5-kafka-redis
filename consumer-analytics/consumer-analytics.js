require('dotenv').config();
const { Kafka } = require('kafkajs');
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

// Configuración de Kafka
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
const consumer = kafka.consumer({ groupId: 'analytics-group' });

// Configuración de la aplicación Express
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
const movieViews = {};

io.on('connection', (socket) => {
  console.log('Cliente conectado para analytics.');
  io.sockets.emit('top10', Object.entries(movieViews).sort((a, b) => b[1] - a[1]).slice(0, 10));
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'movie-selection', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { movie } = JSON.parse(message.value.toString());
      movieViews[movie] = (movieViews[movie] || 0) + 1;

      io.sockets.emit('top10', Object.entries(movieViews).sort((a, b) => b[1] - a[1]).slice(0, 10));
    },
  });
})();

server.listen(process.env.PORT, () => console.log(`Analytics en tiempo real en http://localhost:${process.env.PORT}`));
