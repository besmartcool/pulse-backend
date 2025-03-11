const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String, // Nom de la room
  users: [String], // Liste des emails des utilisateurs dans la room
  createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
