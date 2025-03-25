const express = require("express");
const router = express.Router();
const Pusher = require("pusher");
const Message = require("../models/chat");
const Room = require("../models/rooms");

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

// Envoyer un message (sauvegarder + envoi via Pusher + mise à jour de la room)
router.post("/message", (req, res) => {
  const { text, email, roomId } = req.body;

  const newMessage = new Message({ // création du message
    text,
    senderId: email,
    roomId,
    timestamp: new Date(),
  });

  newMessage
    .save()
    .then((message) => {
      // on récupère la room pour obtenir tous les utilisateurs de cette room
      Room.findById(roomId)
        .then((room) => {
          if (!room) {
            console.error("Erreur : Room non trouvée.");
            return res
              .status(404)
              .json({ result: false, error: "Room non trouvée" });
          }

          // on met à jour la room avec le dernier message
          Room.findByIdAndUpdate(
            roomId,
            { lastMessage: text, lastMessageAt: new Date() },
            { new: true }
          )
            .then((updatedRoom) => {
              if (!updatedRoom) {
                console.error("Erreur : Impossible de mettre à jour la room.");
                return res
                  .status(404)
                  .json({
                    result: false,
                    error: "Impossible de mettre à jour la room",
                  });
              }

              // on récupère les emails des utilisateurs de la room
              const participants = room.users; // Liste des emails des utilisateurs dans la room

              // on envoie l'événement à tous les participants de la room, permet de mettre à jour chez tout le monde
              participants.forEach((participantEmail) => {
                pusher.trigger(`rooms-${participantEmail}`, "room-updated", {
                  _id: roomId,
                  lastMessage: text,
                  lastMessageAt: new Date(),
                });
              });

              // on envoie le message dans le chat en temps réel
              pusher.trigger(`chat-${roomId}`, "chat-message", {
                text,
                senderId: email,
                roomId: roomId,
                timestamp: new Date(),
              });

              res.json({
                result: true,
                message,
                room: updatedRoom,
                lastMessage: text,
              });
            })
            .catch((error) => {
              console.error("Erreur mise à jour room:", error);
              res.status(500).json({ result: false, error: error.message });
            });
        })
        .catch((error) => {
          console.error("Erreur récupération room:", error);
          res.status(500).json({ result: false, error: error.message });
        });
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi du message :", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// On souhaite récupérer l'historique des messages d'une conversation pour les afficher
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
