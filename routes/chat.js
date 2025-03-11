const express = require('express');
const router = express.Router();
const Pusher = require('pusher');
const Message = require('../models/chat');

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Vérifier que toutes les variables d’environnement sont bien chargées
if (!process.env.PUSHER_KEY || !process.env.PUSHER_CLUSTER) {
  console.error("❌ Erreur : Pusher n'est pas correctement configuré.");
}

// 📌 Rejoindre le chat
router.put('/users/:email', (req, res) => {
  pusher.trigger('chat', 'join', {
    email: req.params.email,
  });

  res.json({ result: true });
});

// 📌 Quitter le chat
router.delete("/users/:email", (req, res) => {
  pusher.trigger('chat', 'leave', {
    email: req.params.email,
  });

  res.json({ result: true });
});

// 📌 Envoyer un message (Sauvegarde + Pusher)
router.post('/message', async (req, res) => {
  try {
    const { text, email } = req.body;

    // Sauvegarde en base de données
    const newMessage = new Message({
      text,
      senderId: email,
      timestamp: new Date()
    });

    await newMessage.save();

    // Envoi via Pusher
    pusher.trigger('chat', 'message', {
      text,
      email,
      timestamp: newMessage.timestamp
    });

    res.json({ result: true, message: newMessage });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// 📌 Récupérer l'historique des messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
