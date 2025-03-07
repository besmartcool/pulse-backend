const request = require('supertest');
const app = require('../app');
const mongoose = require("mongoose");
const Association = require("../models/associations");

it('GET /associations/all', async () => {
    const res = await request(app).get('/products');
   
    expect(res.statusCode).toBe(200);
    expect(res.body.stock).toEqual(['iPhone', 'iPad', 'iPod']);
   });