var express = require("express");
var router = express.Router();

const mongoose = require("mongoose"); // ✅ Ajout de mongoose

require("../models/connection");
const Association = require("../models/associations");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkToken } = require("../middlewares/auth");

router.post("/creation", checkToken, (req, res) => {
  console.log(req.body);
  //Check of missing mandatory fields
  if (
    !checkBody(req.body, [
      "name",
      "description",
      "nationalities",
      "categories",
      "residenceCountry",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the association has not already been registered

  Association.findOne({
    name: { $regex: new RegExp(req.body.name, "i") },
  }).then((data) => {
    if (data === null) {

      const newAssociation = new Association({
        name: req.body.name, // required
        description: req.body.description, // required
        nationalities: req.body.nationalities, // required
        residenceCountry: req.body.residenceCountry, //required
        categories: req.body.categories, // required
        languages: req.body.languages,
        interventionZone: req.body.interventionZone,
        lastDeclarationDate: req.body.declarationDate,
        creationDate: req.body.creationDate,
        legalNumber: req.body.legalNumber,
        gallery: req.body.gallery,
        history: req.body.history,
        missions: req.body.missions,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        members: {
            userID: req.user._id,
            role: "admin",
        },
        socialNetworks: req.body.socialNetworks,
      });

      newAssociation.save().then((newAssociation) => {
        res.json({ result: true, newAssociation: newAssociation._id });
      });
    } else {
      // User already exists in database

      res.json({ result: false, error: "Association already exists" });
    }
  });
});

// ROUTE GET ALEATOIRE ASSOCIATIONS
router.get("/randomall", (req, res) => {
  let limit = 50;

  Association.aggregate([{ $sample: { size: limit } }])
    .then((data) => {
      res.json({ result: true, data });
    })
});

// ROUTE GET ASSOCIATIONS
router.get("/all", (req, res) => {

  Association.find().limit(50)
    .then((data) => {
      res.json(data);
    })
});

router.get("/search", (req, res) => {
  const { country, city, category } = req.query;

  let filter = {};

  if (country) {
    filter["address.country"] = country.toUpperCase();
  }
  if (city) {
    filter["address.city"] = city.toUpperCase();
  }
  if (category) {
    filter["categorie"] = category;
  }

  console.log(filter);

  Association.find(filter)
    .limit(50)
    .then((data) => {
      res.json({ result: true, associations: data });
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});
/* 
router.post("/addMembers", async (req, res) => {
  try {
    console.log("Début de l'ajout des membres");

    const associations = await Association.find();
    console.log(`Nombre d'associations trouvées : ${associations.length}`);

    if (!associations.length) {
      return res.json({ result: false, message: "No associations found" });
    }

    const uniqueRoles = ["Président(e)", "Vice-président(e)", "Secrétaire", "Trésorier(e)"];
    const names = [
      "Alice Dupont", "Jean Martin", "Sophie Bernard", "Thomas Lefevre",
      "Emma Moreau", "Lucas Dubois", "Camille Lambert", "Nathan Rousseau",
      "Chloé Vincent", "Léo Girard"
    ];

    const generateMember = (name, role) => {
      console.log(`Création du membre : ${name} avec le rôle ${role}`);
      return {
        userID: new mongoose.Types.ObjectId(),
        name: name,
        role: role,
      };
    };

    for (let association of associations) {
      let members = [];

      for (let i = 0; i < uniqueRoles.length; i++) {
        members.push(generateMember(names[i], uniqueRoles[i]));
      }

      for (let i = uniqueRoles.length; i < names.length; i++) {
        members.push(generateMember(names[i], "Membre actif"));
      }

      console.log(`Ajout des membres à l'association : ${association.name}`);
      association.members = [...association.members, ...members];
      await association.save();
      console.log(`Membres ajoutés à l'association ${association.name}`);
    }

    res.json({ result: true, message: "Members added successfully to all associations" });
  } catch (error) {
    console.error("Error adding members to associations:", error);
    res.status(500).json({ result: false, error: error.message });
  }
}); */



// ROUTE GET ASSOCIATIONS BY ID
router.post("/getByIds", checkToken, (req, res) => {

  console.log(req.body);
  Association.find({ _id: { $in: req.body.ids } })
    .then((data) => {
      res.json({result: true, data});
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});


module.exports = router;
