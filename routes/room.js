const express = require("express");
const router = express.Router();
const Room = require("../models/rooms");
const Message = require("../models/chat");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// 📌 **Créer une room**
router.post("/", (req, res) => {
  const { name, users } = req.body;

  const newRoom = new Room({ name, users });

  newRoom
    .save()
    .then((room) => res.json({ result: true, room }))
    .catch((error) => {
      console.error("Erreur lors de la création de la room :", error);
      res.status(500).json({ error: error.message });
    });
});

// 📌 **Récupérer les rooms d'un utilisateur**
router.get("/:email", (req, res) => {
  Room.find({ users: req.params.email })
    .then((rooms) => res.json(rooms))
    .catch((error) => {
      console.error("Erreur lors de la récupération des rooms :", error);
      res.status(500).json({ error: error.message });
    });
});

// 📌 **Envoyer un message (Sauvegarde + Pusher)**
router.post("/message", (req, res) => {
  const { text, email, roomId } = req.body;

  const newMessage = new Message({
    text,
    senderId: email,
    roomId,
    timestamp: new Date(),
  });

  newMessage
    .save()
    .then((message) => {
      pusher.trigger(`chat-${roomId}`, "message", {
        text: message.text,
        email: message.senderId,
        timestamp: message.timestamp,
      });

      res.json({ result: true, message });
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi du message :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// 📌 **Récupérer les messages d'une room**
router.get("/messages/:roomId", (req, res) => {
  Message.find({ roomId: req.params.roomId })
    .sort({ timestamp: 1 })
    .then((messages) => res.json(messages))
    .catch((error) => {
      console.error("Erreur lors de la récupération des messages :", error);
      res.status(500).json({ error: error.message });
    });
});

// 📌 **Créer une room privée entre 2 utilisateurs**
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
        res.json({ result: true, room: savedRoom });
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la création de la room privée :", error);
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;
