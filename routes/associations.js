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
  let limit = 50; // on définit une limite

  Association.aggregate([{ $sample: { size: limit } }]).then((data) => { // grâce à la méthode aggregate de Mongoose, on peut générer via $sample 50 assos aléatoirement sans logique. size permet de définir une limite
    res.json({ result: true, data });
  });
});

// ROUTE GET ASSOCIATIONS
router.get("/all", (req, res) => { // renvoie toutes les assos
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


// RECHERCHE ASSOCIATION SELON LES FILTRES ACTIVES
router.get("/search", (req, res) => {
  const { originCountry, destinationCountry, city, category } = req.query; // on récupère les filtres

  let filter = {}; // on crée un objet vide
  if (originCountry) { // si origin country existe
    filter["nationality"] = originCountry; // alors on crée une propriété nationality dans filter et on lui met la valeur originCountry
  }
  if (destinationCountry) { // pareil
    filter["address.country"] = destinationCountry.toUpperCase(); // dans la BDD, renseigné en majuscule
  }
  if (city) { // pareil
    filter["address.city"] = city.toUpperCase(); // dans la BDD, renseigné en majuscule
  }
  if (category) { // pareil
    filter["category"] = new RegExp(category, "i"); // on applique un regexp pour que tout colle avec la BDD
  }

  Association.find(filter) // on applique notre filtre au find
    .limit(50) // avec une limite de 50
    .then((data) => {
      res.json({ result: true, associations: data });
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: "Internal Server Error" });
    });
});

// Retrouver le secretaired e chaque asso
router.get("/:associationId/secretary", (req, res) => {
  Association.findById(req.params.associationId) // on cherche l'id de l'asso dans la BDD
    .populate("members.userID") // populate permet de récupérer les détails des users
    .then((association) => {
      if (!association) {
        return res
          .status(404)
          .json({ result: false, error: "Association non trouvée" });
      }

      const secretary = association.members.find(
        (member) => member.role === "Secrétaire"
      ); // renvoie true si il y a un membre avec le role secretaire, sinon renvoie false

      if (!secretary || !secretary.userID) { // si renvoie false alors erreur
        return res
          .status(404)
          .json({ result: false, error: "Aucun secrétaire trouvé" });
      }

      // sinon affiche le bon résultat avec l'id du secretaore
      res.json({ result: true, secretary: secretary.userID });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du secrétaire :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// ROUTE POUR AFFICHAGE DES ASSOCIATIONS DE L'UTILISATEUR DANS LE SCREEN ASSO
router.get("/getAssociationsByIds/:token", checkToken, (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => { // cherche le token dans la BDD
    Association.find({ _id: { $in: data.associations } }) // récupère toutes les associations dont l'_id est dans data.associations, le $in permet de rechercher plusieurs _id à la fois
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
  Association.findOne({ name: req.params.associationName }) // on recherche l'asso par son nom
    .populate("members") // on obtient toutes les infos des membres
    .then((data) => {
      function checkRole(members, userID, role) { // fonction pou savoir si un membre existe avec le bon userId et le bon role
        const exist = members.some(
          (member) => member.userID === userID && member.role === role
        );
        return exist ? true : false ;
      }
      if (checkRole(data.members, req.user.userID, "Secrétaire")) {
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
    Association.findOne({ name: req.params.associationName }) // on cherche l'asso
      .populate("members") // on populate les membres
      .then((data) => {
        data && res.json({ result: true, AssociationData: data }); // on affiche les détails de l'asso
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
