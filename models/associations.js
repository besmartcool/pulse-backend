const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    street: String,
    zipCode: Number,
    city: String,
    department: String,
    country: String,
   });

const socialNetworkSchema = mongoose.Schema({
    name: String,
    url: String,
})

const memberSchema = mongoose.Schema({
    name: String,
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    role: String,
})


const associationSchema = mongoose.Schema({
    name: { type: String, required: true },
    nationality: { type: String, required: true }, // ✅ Correction du champ "nationalities" → "nationality"
    languages: [String],
    interventionZone: [String],
    residenceCountry: { type: String, required: true },
    description: { type: String, required: true },
    categorie: { type: String, required: true }, // ✅ Correction du champ "categories" → "categorie"
    categorieNumber: Number, // ✅ Ajout de "categorieNumber"
    lastDeclarationDate: String,
    creationDate: String,
    legalNumber: String,
    gallery: [String],
    history: [String],
    missions: [String],
    address: addressSchema,
    phone: [String],
    email: [String],
    members: [memberSchema], // ✅ Correction de la structure des membres
    socialNetworks: [socialNetworkSchema],
  });

const Association = mongoose.model('associations', associationSchema);

module.exports = Association;