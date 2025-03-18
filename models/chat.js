const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  senderId: String, // Email expéditeur
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Room
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
