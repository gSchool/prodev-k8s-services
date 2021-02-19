import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import safe from 'express-async-handler';
import pg from 'pg';

const app = express();
const port = process.env['PORT'] || 80;
const pool = new pg.Pool();

app.locals.data = {};
(async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        key VARCHAR(200) PRIMARY KEY NOT NULL,
        value JSONB
      );
    `);
    const { rows: state } = await pool.query(`
        SELECT key, value FROM tasks
    `);
    for (let [key, value] of Object.entries(state)) {
      app.locals.data[key] = value;
    }
    console.log(`Loaded state with ${state.length} records.`)
  } catch (e) {
    console.error('Could not load state from');
    console.error(`  PGHOST: ${process.env.PGHOST}`);
    console.error(`  PGUSER: ${process.env.PGUSER}`);
    console.error(`  PGDATABASE: ${process.env.PGDATABASE}`);
    console.error(`  PGPASSWORD: ${process.env.PGPASSWORD}`);
    console.error(e);
  }
})();

const writeState = async () => {
  try {
    for (let [key, value] of Object.entries(app.locals.data)) {
      await pool.query(`
        INSERT INTO tasks (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) 
        DO UPDATE SET value = EXCLUDED.value
      `, [key, JSON.stringify(value)]);
    }
  } catch (e) {
    console.error(e);
  }
};

app.use(cors({
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/ok', (_, res) => {
  res.status(204);
  res.end();
});

app.use(safe(async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(401);
      res.setHeader('WWW-Authenticate', 'Bearer');
      return res.end();
    }
    const token = req.headers.authorization.substring('Bearer '.length).trim();
    const response = await fetch('http://auth/api/auth/tokens/valid', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Version': req.get('X-Service-Version'),
      },
      body: JSON.stringify({ token }),
    });
    if (response.ok) {
      const { claims } = await response.json();
      res.locals.userId = claims.email;
      next();
    } else {
      console.log('ERROR WITH TOKEN', response.status);
      console.log(await response.text());
      res.status(401);
      res.setHeader('WWW-Authenticate', 'Bearer');
      return res.end();
    }
  } catch (e) {
    console.error(e);
    res.status(500);
    res.end();
  }
}));

app.get('/api/app/todos', (_, res) => res.send(201).end());

app.get('/api/app/todos/items', (_, res) => {
  const items = app.locals.data[res.locals.userId] || [];
  res.json({ items });
});

app.post('/api/app/todos/items', (req, res) => {
  app.locals.data[res.locals.userId] = app.locals.data[res.locals.userId] || [];
  const items = app.locals.data[res.locals.userId];
  items.push({ id: uuid(), text: req.body.text });
  res.json({ items });
  process.nextTick(writeState);
});

app.delete('/api/app/todos/items/:id', (req, res) => {
  const items = app.locals.data[res.locals.userId] || [];
  const index = items.findIndex(item => item.id === req.params.id);
  if (index >= 0) {
    items.splice(index, 1);
  }
  res.json({ items });
  process.nextTick(writeState);
});

app.listen(port, () => console.log(`
⚙️ Now listening on ${port} for application API calls.
`));
