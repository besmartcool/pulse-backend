const express = require("express");
const router = express.Router();
const Room = require("../models/rooms");
const Message = require("../models/chat");
const Pusher = require("pusher");

// Configuration de Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Vérification que Pusher est bien configuré
if (!process.env.PUSHER_KEY || !process.env.PUSHER_CLUSTER) {
  console.error("Erreur : Pusher n'est pas correctement configuré.");
}

// Récupérer toutes les rooms d'un utilisateurs
router.get("/:email", (req, res) => {
  Room.find({ users: req.params.email })
    .then((rooms) => {
      res.json(rooms);
    })
    .catch((error) => {
      console.error("Erreur récupération des rooms :", error);
      res.status(500).json({ error: error.message });
    });
});

// Créer une route entre deux utilisateurs
router.post("/private", (req, res) => {
  const { user1, user2 } = req.body;

  Room.findOne({ users: { $all: [user1, user2] } })
    .then((room) => {
      if (room) {
        return res.json({ result: true, room });
      }

      // Création d'une nouvelle room si elle n'existe pas
      const newRoom = new Room({
        name: `${user2}`,
        users: [user1, user2],
      });

      return newRoom.save().then((savedRoom) => {
        pusher.trigger(`rooms-${user1}`, "room-updated", savedRoom);
        pusher.trigger(`rooms-${user2}`, "room-updated", savedRoom);

        res.json({ result: true, room: savedRoom });
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la création de la room privée :", error);
      res.status(500).json({ error: error.message });
    });
});


module.exports = router;