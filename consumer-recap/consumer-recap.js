const { Kafka } = require('kafkajs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
require('dotenv').config();

// Configurar SQLite
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'movies_recap.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err);
  } else {
    console.log("Conectado a SQLite");
    db.run(`
      CREATE TABLE IF NOT EXISTS movie_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        movie TEXT NOT NULL,
        timestamp DATETIME NOT NULL
      )
    `);
  }
});

// Configurar Kafka
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'recap-group' });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'movie-selection', fromBeginning: true });

  console.log("Consumer conectado. Escuchando eventos...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        const { username, movie, timestamp } = event;

        console.log(`Evento recibido: Usuario: ${username}, Película: ${movie}`);

        // Guardar en SQLite
        db.run(
          `INSERT INTO movie_views (username, movie, timestamp) VALUES (?, ?, ?)`,
          [username, movie, timestamp],
          (err) => {
            if (err) {
              console.error("Error al guardar en SQLite:", err);
            } else {
              console.log("Vista guardada en la base de datos.");
            }
          }
        );
      } catch (err) {
        console.error("Error procesando el evento:", err);
      }
    },
  });
};

startConsumer().catch(console.error);

// Crear API REST para el Recap
const app = express();
const port = process.env.API_PORT || 3000;

app.get('/recap', (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).send("Por favor, proporciona un nombre de usuario.");
  }

  db.all(
    `SELECT movie, timestamp FROM movie_views WHERE username = ? ORDER BY timestamp`,
    [username],
    (err, rows) => {
      if (err) {
        console.error("Error al consultar SQLite:", err);
        res.status(500).send("Error interno del servidor.");
      } else {
        res.json({
          username,
          recap: rows,
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
