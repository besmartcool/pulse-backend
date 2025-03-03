var express = require('express');
var router = express.Router();

require('../models/connection');
const Association = require('../models/associations');
const { checkBody } = require('../modules/checkBody');


router.post('/creation', (req, res) => {

  //Check of missing mandatory fields
  if (!checkBody(req.body, ['name', 'description', 'nationalities', 'categories', ])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the association has not already been registered

  Association.findOne({ name: { $regex: new RegExp(req.body.name, 'i') } }).then(data => {
    if (data === null) {

      const newAssociation = new Association({
        name: req.body.name, // required
        description: req.body.description, // required
        nationalities: req.body.nationalities, // required
        categories: req.body.categories, // required
        languages: req.body.languages,
        interventionZone: [String],
        declarationDate: Date,
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

      newAssociation.save().then(newAssociation => {
        res.json({ result: true, newAssociation });
      });
    } else {

      // User already exists in database

      res.json({ result: false, error: 'Association already exists' });
    }
  });
});


module.exports = router;
