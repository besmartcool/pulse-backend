const request = require("supertest");
const app = require("../app");

const mongoose = require("mongoose");
require("dotenv").config();

const Association = require('../models/associations');
const userToken = "a2ZlxezvjzXKNJsNK2qHwKZfdNjfZBay"; // Remplace par un token valide

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

// --- TEST 2 --- //
// TEST DE CRÉATION D'UNE ASSOCIATION

// Données de test
const AssoTest = {
    name: "Association Creation Test",
    description: "test",
    nationalities: ["test"],
    residenceCountry: "test",
    categories: ["test"]
  };

  beforeAll(async () => {
    // Connexion à la base de données (si ce n'est pas déjà fait dans app.js)
    await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Nettoyage : supprimer l'association créée
    await Association.deleteOne({ name: AssoTest.name });

    // Déconnexion de la base de données
    await mongoose.connection.close();
  });

  it('POST /associations/creation - crée une association et vérifie en base', async () => {
    const res = await request(app)
      .post('/associations/creation')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Content-Type', 'application/json')
      .send(AssoTest);


    // Vérifier le statut HTTP de la réponse
    expect(res.statusCode).toBe(200);
    expect(res.body.newAssociation).toBeDefined();

    // Vérifier si l'association est bien enregistrée en base
    const createdAsso = await Association.findOne({ name: AssoTest.name });
    expect(createdAsso).not.toBeNull();
    expect(createdAsso.description).toBe(AssoTest.description);
  });
