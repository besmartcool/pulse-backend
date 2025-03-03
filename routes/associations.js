var express = require('express');
var router = express.Router();

require('../models/connection');
const Association = require('../models/associations');
const { checkBody } = require('../modules/checkBody');


router.post('/creation', (req, res) => {

  //Check of missing mandatory fields
  if (!checkBody(req.body, ['name', 'description', 'nationalities', 'categories', 'residenceCountry' ])) {
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
        residenceCountry: req.body.residenceCountry, //required
        categories: req.body.categories, // required
        languages: req.body.languages,
        interventionZone: req.body.interventionZone,
        lastDeclarationDate: req.body.declarationDate,
        creationDate: req.body.creationDate,
        legalNumber: req.body.legalNumber,
        gallery: req.body.gallery,
        history: req.body.history,
        missions:req.body.missions,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        members: req.body.members,
        socialNetworks: req.body.socialNetworks,
      });

      newAssociation.save().then(newAssociation => {
        res.json({ result: true, newAssociation: newAssociation._id });
      });
    } else {

      // User already exists in database

      res.json({ result: false, error: 'Association already exists' });
    }
  });
});


module.exports = router;
