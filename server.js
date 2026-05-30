'use strict';

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const ROOT = __dirname;

app.use(express.json({ limit: '4mb' }));

async function readJson(filename, fallback) {
  const filePath = path.join(ROOT, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return fallback;
    throw e;
  }
}

async function writeJson(filename, data) {
  await fs.writeFile(path.join(ROOT, filename), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

app.get('/api/productos', async (req, res) => {
  try {
    res.json(await readJson('productos.json', { meta: {}, productos: [] }));
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo productos.json' });
  }
});

app.put('/api/productos', async (req, res) => {
  try {
    const data = {
      meta: req.body.meta || { actualizado: new Date().toISOString().slice(0, 10) },
      productos: Array.isArray(req.body.productos) ? req.body.productos : []
    };
    await writeJson('productos.json', data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error guardando productos.json' });
  }
});

app.get('/api/ingresos', async (req, res) => {
  try {
    res.json(await readJson('ingresos.json', { ingresos: [] }));
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo ingresos.json' });
  }
});

app.put('/api/ingresos', async (req, res) => {
  try {
    const data = { ingresos: Array.isArray(req.body.ingresos) ? req.body.ingresos : [] };
    await writeJson('ingresos.json', data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error guardando ingresos.json' });
  }
});

app.get('/api/ordenes', async (req, res) => {
  try {
    res.json(await readJson('ordenes.json', { ordenes: [] }));
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo ordenes.json' });
  }
});

app.put('/api/ordenes', async (req, res) => {
  try {
    const data = { ordenes: Array.isArray(req.body.ordenes) ? req.body.ordenes : [] };
    await writeJson('ordenes.json', data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error guardando ordenes.json' });
  }
});

app.use(express.static(ROOT, { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

function startServer(port) {
  port = port || Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log('Inventario Gas → http://localhost:' + port);
  });
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE' && port < 3010) {
      console.warn('Puerto ' + port + ' ocupado, probando ' + (port + 1) + '…');
      startServer(port + 1);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
