const request = require('supertest');
const mongoose = require('mongoose'); // Si tu utilises MongoDB
const app = require('../app'); // Assure-toi du bon chemin vers app.js
const Association = require('../models/associations'); // Modèle de l'association

const userToken = "a2ZlxezvjzXKNJsNK2qHwKZfdNjfZBay"; // Remplace par un token valide

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