var express = require("express");
var router = express.Router();

const mongoose = require("mongoose"); // ✅ Ajout de mongoose

require("../models/connection");
const Association = require("../models/associations");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkToken } = require("../middlewares/auth");

router.post("/creation", checkToken, (req, res) => {
  //Check of missing mandatory fields
  if (
    !checkBody(req.body, [
      "name",
      "description",
      "nationality",
      "category",
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
        nationality: req.body.nationality, // required
        residenceCountry: req.body.residenceCountry, //required
        category: req.body.category, // required
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
          name: "Dummy Name",
          userID: req.user._id,
          role: "admin",
        },
        socialNetworks: req.body.socialNetworks,
      });

      newAssociation.save().then((newAssociation) => {
        User.updateOne(
          { _id: req.user._id },
          { associations: [...req.user.associations, newAssociation._id] }
        ).then((data) => {
          if (data.modifiedCount === 1) {
            console.log(
              "nouvelle asso correctement ajoutée aux assos de l'utilisateur"
            );
            res.json({ result: true, newAssociation: newAssociation._id });
          } else {
            console.log(
              "Attention, nouvelle asso pas ajoutée aux assos de l'utilisateur"
            );
            res.json({ result: true, newAssociation: newAssociation._id });
          }
        });
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

  Association.aggregate([{ $sample: { size: limit } }]).then((data) => {
    res.json({ result: true, data });
  });
});

// ROUTE GET ASSOCIATIONS
router.get("/all", (req, res) => {
  Association.find()
    .limit(50)
    .then((data) => {
      res.json(data);
    });
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
    filter["category"] = category;
  }

  Association.find(filter)
    .limit(50)
    .then((data) => {
      res.json({ result: true, associations: data });
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});

/* router.post("/addMembers", async (req, res) => {
  try {

    const associations = await Association.find();

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

      association.members = [...association.members, ...members];
      await association.save();
    }

    res.json({ result: true, message: "Members added successfully to all associations" });
  } catch (error) {
    console.error("Error adding members to associations:", error);
    res.status(500).json({ result: false, error: error.message });
  }
}); */

// ROUTE GET ASSOCIATIONS BY ID
router.get("/getAssociationsByIds/:token", checkToken, (req, res) => {
  User.findOne({ token: req.params.token })
  .then((data) => {
    Association.find({ _id: { $in: data.associations } })
      .then((data) => {
        res.json({ result: true, data });
      })
      .catch((err) => {
        res.status(500).json({ result: false, error: "Internal Server Error" });
      });
  });
});

// ROUTE GET ASSOCIATION BY NAME
router.get("/getAssociationByName/:associationName", checkToken, (req, res) => {
  console.log("req.params:", req.params)
  Association.findOne({ name: req.params.associationName })
  .populate("members")
  .then((data) => {
    res.json({ result: true, data });
  })
  .catch((err) => {
    res.status(500).json({ result: false, error: "Internal Server Error" });
  })
});

module.exports = router;
