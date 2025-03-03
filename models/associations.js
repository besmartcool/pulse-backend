const mongoose = require('mongoose');

const associationSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
  canBookmark: Boolean,
});

const Association = mongoose.model('associations', associationSchema);

module.exports = Association;