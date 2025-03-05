var express = require("express");
var router = express.Router();

require("../models/connection");
const Association = require("../models/associations");
const { checkBody } = require("../modules/checkBody");

router.post("/creation", (req, res) => {
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
        members: req.body.members,
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

// ROUTE GET ALEATOIRE ASSOCIATION

router.get("/all", (req, res) => {
  let limit = 15;

  Association.aggregate([{ $sample: { size: limit } }])
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// ROUTE GET CATEGORIES
router.get("/categories/:category", (req, res) => {
  const category = req.params.category;

  Association.find({ categorie: category })
    .limit(50)
    .then((data) => {
      res.json({ result: true, associations: data });
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});

router.get("/countries/:country", (req, res) => {
  const country = req.params.country;

  Association.find({ nationality: country })
    .limit(50)
    .then((data) => {
      res.json({ result: true, associations: data });
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});


module.exports = router;
