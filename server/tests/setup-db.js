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

export function as(user) {
  const auth = req => req.set('Authorization', `Bearer ${user.token}`);
  return {
    get: path => auth(request(app).get(path)),
    post: (path, body) => auth(request(app).post(path)).send(body),
    put: (path, body) => auth(request(app).put(path)).send(body),
    delete: path => auth(request(app).delete(path)),
    upload: (path, fields, buffer, filename = 'photo.png', contentType = 'image/png') => {
      let req = auth(request(app).post(path));
      Object.entries(fields).forEach(([key, value]) => {
        req = req.field(key, value);
      });
      return buffer ? req.attach('photo', buffer, { filename, contentType }) : req;
    },
  };
}
