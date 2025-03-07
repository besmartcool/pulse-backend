const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
require("dotenv").config();
const Association = require("../models/associations");

// TEST INITIAL DE SUPERTEST
describe("Test the root path", () => {
  test("It should respond to the initial GET method", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
  });
});

// TEST RÉCUPÉRATION D'ASSOCIATIONS ALÉATOIRES
describe("GET /associations/randomall", () => {
  beforeAll(() => { // AVANT TOUT, ON EXECUTE CECI :
    return mongoose // CONNECTION À LA BDD
      .connect(process.env.CONNECTION_STRING)
  });

  afterAll(() => { // APRÈS TOUT, ON EXECUTE CECI :
    return mongoose.connection.close()
  });

  it("Should return up to 50 random associations", () => { // TEST
    return request(app)
      .get("/associations/randomall")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.data.length).toBeLessThanOrEqual(50);
      });
  });
});
