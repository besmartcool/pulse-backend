var express = require('express');
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  };
  const hash = bcrypt.hashSync(req.body.password, 10);

  
  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const newUser = new User({
        // username: req.body.username,
        // firstname: req.body.firstname,
        // lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        // residenceCountry: req.body.residenceCountry,
        // nationality: req.body.nationality,
        // destinationCountry: req.body.destinationCountry,
        // profilePicture: req.body.profilePicture,
      });

      newUser.save().then((user) => {
        res.json({ result: true, token: user.token, email: user.email });
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  });
  });


  router.post("/signin", (req, res) => {
    if (!checkBody(req.body, ["email", "password"])) {
      res.json({ result: false, error: "Missing or empty fields" });
      return;
    }
  
    User.findOne({ email: req.body.email }).then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, username: data.username });
      } else {
        res.json({ result: false, error: "User not found or wrong password" });
      }
    });
  });




module.exports = router;
