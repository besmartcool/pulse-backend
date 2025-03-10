var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

require("../models/connection");
const Room = require("../models/rooms");
const Message = require("../models/messages");
const User = require("../models/users");
const { checkToken } = require("../middlewares/auth");

// Route pour créer une nouvelle conversation (room) entre deux utilisateurs
router.post("/create-room", /* checkToken, */ (req, res) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    res.json({ result: false, error: "User IDs required" });
    return;
  }

  Room.findOne({ users: { $all: [userId1, userId2] } })
    .then((existingRoom) => {
      if (existingRoom) {
        res.json({ result: true, roomId: existingRoom._id });
      } else {
        const newRoom = new Room({
          users: [userId1, userId2],
          lastMessage: "",
        });

        newRoom.save().then((savedRoom) => {
          res.json({ result: true, roomId: savedRoom._id });
        });
      }
    })
    .catch(() => res.status(500).json({ result: false, error: "Internal Server Error" }));
});

// Route pour récupérer toutes les rooms d'un utilisateur
router.get("/rooms/:userId", /* checkToken, */ (req, res) => {
  const { userId } = req.params;

  Room.find({ users: userId })
    .sort({ timestamp: -1 })
    .then((rooms) => res.json({ result: true, rooms }))
    .catch(() => res.status(500).json({ result: false, error: "Internal Server Error" }));
});

// Route pour récupérer tous les messages d'une room
router.get("/messages/:roomId", /* checkToken, */ (req, res) => {
  const { roomId } = req.params;

  Message.find({ roomId })
    .sort({ timestamp: 1 })
    .then((messages) => res.json({ result: true, messages }))
    .catch(() => res.status(500).json({ result: false, error: "Internal Server Error" }));
});

// Route pour envoyer un message dans une room
router.post("/send-message", /* checkToken, */ (req, res) => {
  const { roomId, senderId, text } = req.body;

  if (!roomId || !senderId || !text) {
    res.json({ result: false, error: "Missing fields" });
    return;
  }

  const newMessage = new Message({
    roomId,
    senderId,
    text,
  });

  newMessage
    .save()
    .then((savedMessage) => {
      return Room.findByIdAndUpdate(roomId, {
        lastMessage: text,
        timestamp: new Date(),
      }).then(() => savedMessage);
    })
    .then((savedMessage) => res.json({ result: true, message: savedMessage }))
    .catch(() => res.status(500).json({ result: false, error: "Internal Server Error" }));
});

// Route pour supprimer une room et ses messages
router.delete("/delete-room/:roomId", /* checkToken, */ (req, res) => {
  const { roomId } = req.params;

  Message.deleteMany({ roomId })
    .then(() => Room.findByIdAndDelete(roomId))
    .then(() => res.json({ result: true, message: "Room and messages deleted successfully" }))
    .catch(() => res.status(500).json({ result: false, error: "Internal Server Error" }));
});

module.exports = router;
