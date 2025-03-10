const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', required: true }, // Référence à la Room
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Expéditeur du message
  text: { type: String, required: true }, // Contenu du message
  timestamp: { type: Date, default: Date.now }, // Date d'envoi
});

const Message = mongoose.model('messages', messageSchema);

module.exports = Message;
