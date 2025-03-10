const mongoose = require('mongoose');



const userSchema = mongoose.Schema({
    username: { type: String, default: "", trim: true },
    firstname:{ type: String, default: "", trim: true },
    lastname: { type: String, default: "", trim: true },
    email: { type: String, lowercase: true, trim: true, required: true },
    password: { type: String, required: true },
    token: String,
    residenceCountry: { type: String, default: "", trim: true },
    nationality: [{ type: String, default: "", trim: true }],
    destinationCountry: [{ type: String, default: "", trim: true }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'associations' }],
    associations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'associations' }],

   });

   

const User = mongoose.model('users', userSchema);

module.exports = User;