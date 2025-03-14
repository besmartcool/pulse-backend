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

// Fonction pour générer un utilisateur aléatoire
function generateRandomUser() {
  const firstName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const lastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
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
      if (!asso.email || Array.isArray(asso.email)) {
        asso.email = "";
      }

      if (!asso.residenceCountry) {
        asso.residenceCountry = "Non spécifié";
      }

      if (asso.members.length < 4) {
        const newMembers = [];
        const existingRoles = asso.members.map((m) => m.role);
        const missingRoles = roles.filter((role) => !existingRoles.includes(role));

        for (let role of missingRoles) {
          const newUserInfo = generateRandomUser();

          // 🔹 Vérifier si l'utilisateur existe déjà dans la base
          let user = await User.findOne({ email: newUserInfo.email });

          if (!user) {
            // 🔹 Appel à `/signup` pour créer l'utilisateur
            const response = await fetch("http://localhost:3000/users/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: newUserInfo.email,
                password: "hashedpassword",
                firstname: newUserInfo.firstname,
                lastname: newUserInfo.lastname,
              }),
            });

            const result = await response.json();

            if (result.result) {
              user = await User.findOne({ email: newUserInfo.email }); // On récupère l'utilisateur fraîchement créé
            }
          }

          if (user) {
            newMembers.push({
              name: `${user.firstname} ${user.lastname}`,
              userID: user._id, // 📌 Utiliser l'ID existant
              role: role,
            });
          }
        }

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
