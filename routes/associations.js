var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");

require("../models/connection");
const Association = require("../models/associations");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkToken } = require("../middlewares/auth");

// ROUTE POUR CREATION D'UNE NOUVELLE ASSOCIATION
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

router.get("/:id/members", (req, res) => {
  Association.findById(req.params.id)
    .populate("members.userID")
    .then((association) => {
      if (!association) {
        return res.status(404).json({ message: "Association introuvable" });
      }

      res.json(association.members);
    })
    .catch((error) =>
      res.status(500).json({ error: "Erreur serveur", details: error })
    );
});

module.exports = router;

// RECHERCHE ASSOCIATION SELON LES FILTRES ACTIVES
router.get("/search", (req, res) => {
  const { originCountry, destinationCountry, city, category } = req.query;

  let filter = {};
  if (originCountry) {
    filter["nationality"] = originCountry;
  }
  if (destinationCountry) {
    filter["address.country"] = destinationCountry.toUpperCase(); // 🔥 Correction ici
  }
  if (city) {
    filter["address.city"] = city.toUpperCase();
  }
  if (category) {
    filter["category"] = new RegExp(category, "i");
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

// Retrouver le secretaired e chaque asso
router.get("/:associationId/secretary", (req, res) => {
  Association.findById(req.params.associationId)
    .populate("members.userID")
    .then((association) => {
      if (!association) {
        return res
          .status(404)
          .json({ result: false, error: "Association non trouvée" });
      }

      const secretary = association.members.find(
        (member) => member.role === "Secrétaire"
      );

      if (!secretary || !secretary.userID) {
        return res
          .status(404)
          .json({ result: false, error: "Aucun secrétaire trouvé" });
      }

      res.json({ result: true, secretary: secretary.userID });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du secrétaire :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// ROUTE POUR AFFICHAGE DES ASSOCIATIONS DE L'UTILISATEUR DANS LE SCREEN ASSO
router.get("/getAssociationsByIds/:token", checkToken, (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => {
    Association.find({ _id: { $in: data.associations } })
      .then((data) => {
        res.json({ result: true, data });
      })
      .catch((err) => {
        res.status(500).json({ result: false, error: "Internal Server Error" });
      });
  });
});

// ROUTE QUI VERIFIE SI L'UTILISATEUR EST ADMIN DE L'ASSOCIATION QU'IL EST EN TRAIN DE VISUALISER
router.get("/checkAdminStatus/:associationName", checkToken, (req, res) => {
  Association.findOne({ name: req.params.associationName })
    .populate("members")
    .then((data) => {
      function checkRole(members, userID, role) {
        const exist = members.some(
          (member) => member.userID === userID && member.role === role
        );
        return exist ? "OK" : "NO";
      }
      if (checkRole(data.members, req.user.userID, "admin")) {
        res.json({ result: true });
      } else {
        res.json({ result: false });
      }
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});

// ROUTE QUI RENVOIE LES DONNEES DE L'ASSOCIATION AU FORMULAIRE POUR MISE A JOUR
router.get(
  "/associationBeingUpdated/:associationName",
  checkToken,
  (req, res) => {
    Association.findOne({ name: req.params.associationName })
      .populate("members")
      .then((data) => {
        data && res.json({ result: true, AssociationData: data });
      })
      .catch((err) => {
        res.status(500).json({ result: false, error: "Internal Server Error" });
      });
  }
);

// ROUTE POUR MISE A JOURS DES INFOS D'UNE  ASSOCIATION
router.post("/update", checkToken, async (req, res) => {
  // Vérification des champs obligatoires
  if (
    !checkBody(req.body, [
      "name",
      "description",
      "nationality",
      "category",
      "residenceCountry",
    ])
  ) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  // Conversion du req.body._id en ObjectId pour la recherche (sinon MongoDB ne reconnaît pas)
  const associationId = new mongoose.Types.ObjectId(req.body._id);

  // Préparation des champs à mettre à jour
  const updatedFields = req.body;
  delete updatedFields._id;

  Association.updateOne({ _id: associationId }, { $set: updatedFields }).then(
    (result) => {
      if (result.modifiedCount > 0) {
        return res.json({
          result: true,
          message: "Association updated successfully",
        });
      } else {
        return res.json({
          result: false,
          error: "No changes made or association not found",
        });
      }
    }
  );
});

module.exports = router;
