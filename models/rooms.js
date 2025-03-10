const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }], // Deux utilisateurs
  lastMessage: { type: String, default: '' }, // Aperçu du dernier message
  timestamp: { type: Date, default: Date.now },
});

const Room = mongoose.model('rooms', roomSchema);

module.exports = Room;
