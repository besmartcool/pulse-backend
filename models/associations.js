const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    street: String,
    zipcode: Number,
    city: String,
    region: String,
    country: String,
   });

const socialNetworkSchema = mongoose.Schema({
    name: String,
    url: String,
})

const memberSchema = mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    role: String,
})


const associationSchema = mongoose.Schema({
  name: String, // required
  description: String, // required
  nationalities: [String], // required
  categories: [String], // required
  languages: [String],
  interventionZone: [String],
  lastDeclarationDate: Date,
  creationDate: Date,
  legalNumber: String,
  gallery: [String],
  history: [String],
  missions:[String],
  address: addressSchema,
  phone: [String],
  email: String,
  members: [memberSchema],
  socialNetworks: [socialNetworkSchema],
});

const Association = mongoose.model('associations', associationSchema);

module.exports = Association;