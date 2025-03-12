const express = require("express");
const router = express.Router();
const Pusher = require("pusher");
const Message = require("../models/chat");

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

// // Envoyer un message (sauvegarder + envoi via Pusher)
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
      pusher.trigger(`chat-${roomId}`, "chat-message", { // Envoi du message en temps réel avec Pusher
        text: message.text,
        senderId: message.senderId,
        timestamp: message.timestamp,
      })

      res.json({ result: true, message });
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi du message :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// Récupérer l'historique des messages d'une conversation
router.get("/messages/:roomId", (req, res) => {
  Message.find({ roomId: req.params.roomId })
    .sort({ timestamp: 1 }) // Tri du plus ancien au plus récent
    .then((messages) => {
      res.json(messages);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;
