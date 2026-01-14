const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

const DB_FILE = path.join(__dirname, '..', 'users.json');

const testUser = { id: 'test-id', name: 'Test User', email: 'test@example.com' };

beforeEach(() => {
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || [];
  } catch (err) {
    users = [];
  }
  const filtered = users.filter((u) => u.id !== testUser.id);
  fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2), 'utf8');
});

afterAll(() => {
  // limpiar el usuario de prueba al final
  try {
    const users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || [];
    const filtered = users.filter((u) => u.id !== testUser.id);
    fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  } catch (err) {
    // ignore
  }
});

it('Debe responder el endpoint raíz', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/Servidor en ejecucion/i);
});

it('Debe crear un nuevo usuario', async () => {
  const res = await request(app).post('/users').send(testUser);
  expect(res.statusCode).toBe(201);
  expect(res.body.user).toMatchObject(testUser);
});

it('Debe obtener todos los usuarios', async () => {
  const res = await request(app).get('/users');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

it('Debe buscar el usuario creado', async () => {
  // Asegurar que el usuario exista
  await request(app).post('/users').send(testUser);
  const res = await request(app).get(`/users/${testUser.id}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.user).toMatchObject(testUser);
});
