const request = require("supertest");
const app = require("../app");

const mongoose = require("mongoose");
require("dotenv").config();
// --- TEST 1 --- //
// RÉCUPÉRATION DE 50 ASSOCIATIONS AU HASARD
describe("GET /associations/randomall", () => {
  beforeAll(() => { // AVANT TOUT, ON EXECUTE CECI :
    return mongoose // CONNECTION À LA BDD
      .connect(process.env.CONNECTION_STRING)
  });

  afterAll(() => { // APRÈS TOUT, ON EXECUTE CECI :
    return mongoose.connection.close() // DECONNECTION À LA BDD
  });

  it("Should return up to 50 random associations", () => { // TEST
    return request(app)
      .get("/associations/randomall") // DIRECTION VERS LA ROUTE
      .expect("Content-Type", /json/) // EN JSON
      .then((res) => { // ON VÉRIFIE SI LA ROUTE NOUS RENVOIE BIEN
        expect(res.statusCode).toBe(200); // UN STATUSCODE 200
        expect(res.body.result).toBe(true); // UN RESULT = À TRUE
        expect(res.body.data.length).toBeLessThanOrEqual(50); // UN TABLEAU DE DONNÉES <= 50
      });
  });
});
