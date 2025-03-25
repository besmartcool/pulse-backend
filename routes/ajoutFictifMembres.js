const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("../models/connection");
const Association = require("../models/associations");
const User = require("../models/users");

const roles = ["Président", "Secrétaire", "Membre actif", "Membre actif"];
const fakeNames = ["Jean", "Marie", "Paul", "Sophie", "Pierre", "Lucie"];
const fakeLastNames = ["Dupont", "Durand", "Martin", "Lefevre", "Morel"];

const fetch = require("node-fetch");

// ROUTE POUR GÉNÉRER DES MEMBRES FICTIFS DANS LES ASSOCIATIONS -- A LANCER VIA THUNDERCLIENT UNE SEULE FOIS

// Génère un utilisateur fictif aléatoire (prénom, nom, email)
function generateRandomUser() {
  const firstName = fakeNames[Math.floor(Math.random() * fakeNames.length)]; // on prend un prénom
  const lastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)]; // un nom de famille
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@asso.com`; // on crée l'email
  return { firstname: firstName, lastname: lastName, email };
}

// ROUTE pour générer des membres fictifs dans toutes les associations
router.post("/generate-fake-members", (req, res) => {
  // Récupère toutes les associations de la base
  Association.find({})
    .then((associations) => {
      // Si aucune association n’est trouvée, on arrête là
      if (!associations.length) {
        return res.json({ result: false, message: "Aucune association trouvée" });
      }

      let updatedCount = 0; // Compte combien d’associations ont été mises à jour

      // Pour chaque association, on va tenter d'ajouter les membres fictifs
      const promises = associations.map((asso) => {
        // Normalisation des champs (protection contre les valeurs bizarres)
        if (!asso.email || Array.isArray(asso.email)) {
          asso.email = "";
        }
        if (!asso.residenceCountry) {
          asso.residenceCountry = "Non spécifié";
        }

        // Si l’association a déjà 4 membres ou plus, on passe
        if (asso.members.length >= 4) {
          return Promise.resolve();
        }

        const newMembers = [];
        const existingRoles = asso.members.map((m) => m.role); // on regarde les rôles déjà présents
        const missingRoles = roles.filter((role) => !existingRoles.includes(role)); // et ceux manquants

        // Pour chaque rôle manquant, on génère un utilisateur
        const rolePromises = missingRoles.map((role) => {
          const newUserInfo = generateRandomUser();

          // Vérifie si l'utilisateur existe déjà
          return User.findOne({ email: newUserInfo.email }) // si l'email est déjà dedans alors
            .then((user) => {
              if (user) return user; // on arrête

              // Sinon, on le crée via un appel à /signup
              return fetch("http://localhost:3000/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: newUserInfo.email,
                  password: "hashedpassword",
                  firstname: newUserInfo.firstname,
                  lastname: newUserInfo.lastname,
                }),
              })
                .then((response) => response.json())
                .then((result) => {
                  // Si la création a fonctionné, on récupère le user en BDD
                  if (result.result) {
                    return User.findOne({ email: newUserInfo.email });
                  } else {
                    return null; // Création échouée
                  }
                });
            })
            .then((user) => {
              if (user) {
                // On prépare le nouveau membre à insérer dans l'association
                newMembers.push({
                  name: `${user.firstname} ${user.lastname}`,
                  userID: user._id,
                  role: role,
                });
              }
            });
        });

        // Une fois tous les rôles générés/traités...
        return Promise.all(rolePromises).then(() => {
          if (newMembers.length > 0) {
            // On ajoute les nouveaux membres et on sauvegarde l’association
            asso.members = [...asso.members, ...newMembers];
            return asso.save().then(() => {
              updatedCount++; // Une association mise à jour
            });
          }
        });
      });

      // On attend que toutes les associations aient été traitées
      return Promise.all(promises).then(() => {
        // Réponse finale avec le nombre d’associations modifiées
        res.json({
          result: true,
          message: `Membres fictifs ajoutés pour ${updatedCount} associations`,
        });
      });
    })

    // En cas d’erreur générale
    .catch((error) => {
      console.error("Erreur lors de l'ajout des membres fictifs :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

module.exports = router;
