import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import safe from 'express-async-handler';

import { makeFactory, verifyFactory } from './tokens.mjs';
const jwt_secret = process.env.JWT_SECRET;
const makers = makeFactory(jwt_secret);
const verifiers = verifyFactory(jwt_secret);

mongoose
  .connect(process.env['MONGODB_URL'], {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
const db = mongoose.connection;
const credentialSchema = new mongoose.Schema({
  email: { type: String, required: true },
  hashed_password: { type: String, required: true },
});
const Credential = mongoose.model('Credential', credentialSchema);

const app = express();
const port = process.env['PORT'] || 80;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/ok', (_, res) => {
  res.status(204);
  res.end();
});

app.get('/api/auth', (_, res) => res.status(204).end());

app.post('/api/auth/register', safe(async (req, res) => {
  const { email, password } = req.body;
  const hashed_password = await argon2.hash(password.trim());

  const version = Number.parseFloat(req.headers['x-service-version']);
  const maker = makers(version);

  const c = new Credential({ email: email.toLowerCase(), hashed_password });
  await c.save();
  res.status(201);
  const token = await maker({ claims: { email } });
  res.json({ token });
}));

app.post('/api/auth/login', safe(async (req, res) => {
  const { email, password } = req.body;
  const c = await Credential.findOne({ email: email.toLowerCase() });
  const result = await argon2.verify(c.hashed_password, password);

  const version = Number.parseFloat(req.headers['x-service-version']);
  const maker = makers(version);

  if (result) {
    res.status(201);
    const token = await maker({ claims: { email } });
    res.json({ token });
  } else {
    res.status(400);
    res.json({ message: 'No credentials match.' });
  }
}));

app.put('/api/auth/tokens/valid', safe(async (req, res) => {
  const version = Number.parseFloat(req.headers['x-service-version']);
  const verifier = verifiers(version);
  const { token } = req.body;
  try {
    const claims = await verifier(token);
    res.json({ claims });
  } catch (e) {
    console.error(`Error occurred in validation:`, token);
    console.error(e.error);
    res.status(e.code || 412);
    res.json({ message: e.message });
  }
}));

app.listen(port, () => console.log(`
⚙️ Now listening on ${port} for authentication API calls.
`));
