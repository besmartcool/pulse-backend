const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("../models/connection");
const Association = require("../models/associations");
const User = require("../models/users");

const roles = ["Président", "Secrétaire", "Membre actif", "Membre actif"];
const fakeNames = ["Jean", "Marie", "Paul", "Sophie", "Pierre", "Lucie"];
const fakeLastNames = ["Dupont", "Durand", "Martin", "Lefevre", "Morel"];

// Fonction pour générer un utilisateur aléatoire
function generateRandomUser() {
  const firstName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const lastName =
    fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@asso.com`;

  return { firstname: firstName, lastname: lastName, email };
}

// 🚀 ROUTE API POUR GÉNÉRER DES MEMBRES FICTIFS POUR TOUTES LES ASSOCIATIONS
router.post("/generate-fake-members", async (req, res) => {
  try {
    const associations = await Association.find({});

    if (!associations.length) {
      return res.json({ result: false, message: "Aucune association trouvée" });
    }

    let updatedCount = 0;

    for (let asso of associations) {
      // 🔹 Vérifier et corriger les erreurs sur les champs email et residenceCountry
      if (!asso.email || Array.isArray(asso.email)) {
        asso.email = ""; // Forcer une valeur correcte
      }

      if (!asso.residenceCountry) {
        asso.residenceCountry = "Non spécifié"; // Donner une valeur par défaut
      }

      // 🔹 Vérifier si l'association a déjà au moins 4 membres
      if (asso.members.length < 4) {
        const newMembers = [];

        // Vérifier quels rôles sont déjà présents
        const existingRoles = asso.members.map((m) => m.role);
        const missingRoles = roles.filter(
          (role) => !existingRoles.includes(role)
        );

        for (let role of missingRoles) {
          const newUserInfo = generateRandomUser();

          let user = await User.findOne({ email: newUserInfo.email });

          if (!user) {
            user = new User({
              firstname: newUserInfo.firstname,
              lastname: newUserInfo.lastname,
              email: newUserInfo.email,
              password: "hashedpassword", // ⚠️ Remplacer par un vrai hash
            });

            await user.save();
          }

          newMembers.push({
            name: `${user.firstname} ${user.lastname}`,
            userID: user._id,
            role: role,
          });
        }

        // 🔹 Ajouter les nouveaux membres à l'association
        if (newMembers.length > 0) {
          asso.members = [...asso.members, ...newMembers];
          await asso.save();
          updatedCount++;
        }
      }
    }

    res.json({
      result: true,
      message: `Membres fictifs ajoutés pour ${updatedCount} associations`,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des membres fictifs :", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
