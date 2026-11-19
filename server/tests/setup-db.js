import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';

let server;

export async function startDatabase() {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri());
}

export async function stopDatabase() {
  await mongoose.disconnect();
  await server.stop();
}

export async function signUp(name, email) {
  const res = await request(app).post('/api/auth/signup').send({ name, email, password: 'password123' });
  return { token: res.body.token, id: res.body.user.id };
}
