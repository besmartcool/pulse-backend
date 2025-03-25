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
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    name: String,
    role: String,
})


const associationSchema = mongoose.Schema({
    name: { type: String, required: true },
    nationality: { type: String, required: true },
    languages: [String],
    interventionZone: [String],
    residenceCountry: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    categorieNumber: Number,
    lastDeclarationDate: String,
    creationDate: String,
    legalNumber: String,
    gallery: [String],
    history: [String],
    missions: [String],
    address: addressSchema,
    phone: [String],
    email: { type: String, trim: true },
    members: [memberSchema],
    socialNetworks: [socialNetworkSchema],
  });

const Association = mongoose.model('associations', associationSchema);

module.exports = Association;