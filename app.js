const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const os = require('os');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/mydatabase';
const client = new MongoClient(mongoUrl);

function getAllLocalIps() {
    const interfaces = os.networkInterfaces();
    const ips = ['localhost'];

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }

    return ips;
}

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

async function connectWithRetry() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await client.connect();
      console.log('Conectado exitosamente a MongoDB');
      return;
    } catch (err) {
      console.error(`Intento ${i + 1} de ${MAX_RETRIES}:`, err.message);
      if (i < MAX_RETRIES - 1) {
        console.log(`Reintentando en ${RETRY_DELAY_MS / 1000} segundos...`);
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      } else {
        console.error('Número máximo de reintentos alcanzado. Cerrando aplicación.');
        process.exit(1);
      }
    }
  }
}

async function startApp() {
  await connectWithRetry();

  const dbName = new URL(mongoUrl).pathname.substring(1) || 'mydatabase';
  const db = client.db(dbName);
  const collection = db.collection('artworks');

  app.get('/api/artworks', async (req, res) => {
    try {
      const artworks = await collection.find({}).toArray();
      res.json(artworks);
    } catch (error) {
      console.error('Error al obtener obras:', error);
      res.status(500).send('Error interno del servidor');
    }
  });

  app.post('/api/artworks', async (req, res) => {
    try {
      const newArtwork = req.body;
      if (!newArtwork || Object.keys(newArtwork).length === 0) {
        return res.status(400).send('Datos vacíos');
      }
      const result = await collection.insertOne(newArtwork);
      console.log('Obra insertada:', result.insertedId);
      res.status(201).send({ message: 'Insertado exitosamente', id: result.insertedId });
    } catch (error) {
      console.error('Error al insertar:', error);
      res.status(500).send('Error interno');
    }
  });

  app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });
  
app.listen(port, () => {
    const ips = getAllLocalIps();
    console.log(`Servidor iniciado en el puerto ${port}`);
    ips.forEach(ip => {
      console.log(`Panel de administración: http://${ip}:${port}/admin`);
      console.log(`Galería de arte: http://${ip}:${port}/gallery`);
    });
  });
}

startApp().catch(console.error);
