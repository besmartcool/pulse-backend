const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  senderId: String, // Email de l'expéditeur
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Référence vers la room
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
