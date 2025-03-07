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
      .then(() => {
        return Association.insertMany([ // ON AJOUTE À LA BDD DES INFOS À TESTER
          {
            name: "Association A",
            description: "Description de l'asso A",
            categories: ["Social"],
          },
          {
            name: "Association B",
            description: "Description de l'asso B",
            categories: ["Education"],
          },
        ]);
      });
  });

  afterAll(() => { // APRÈS TOUT, ON EXECUTE CECI :
    return Association.deleteMany({ // ON SUPPRIME UNIQUEMENT CE QUE L'ON VIENT DE CRÉER DANS LA BDD
      name: { $in: ["Association A", "Association B"] },
    })
    .then(() => mongoose.connection.close());
  });

  it("Should return up to 50 random associations", () => { // TEST
    return request(app)
      .get("/associations/randomall")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
});
