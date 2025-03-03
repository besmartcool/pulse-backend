const mongoose = require('mongoose');



const userSchema = mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    token: String,
    residenceCountry: String,
    nationality: String,
    destinationCountry: String,
    profilPicture: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'associations' }],
    associations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'associations' }],

   });

   

const User = mongoose.model('users', userSchema);

module.exports = User;