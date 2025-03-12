const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String, // Nom de la room
  users: [String], // Liste des emails des utilisateurs dans la room
  lastMessage: String, // Dernier message envoyé
  lastMessageAt: Date, // Date du dernier message
  createdAt: { type: Date, default: Date.now } // Date de création
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
