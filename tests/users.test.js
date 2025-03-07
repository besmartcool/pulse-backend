
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const connectionString = process.env.CONNECTION_STRING;


beforeAll(async () => {
    await mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  });


afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test pour tester la route signup de l'application
it('POST /users/signup', async () => {
   
    const res = await request(app).post('/users/signup').send({
      email: 'test@gmail.com',
      password: 'azerty123',
    });
   
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
   });

// Test pour tester la route signin de l'application

   it('POST /users/signin', async () => {
   
    const res = await request(app).post('/users/signin').send({
      email: 'test@gmail.com',
      password: 'azerty123',
    });
   
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
   });