var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const { checkToken } = require("../middlewares/auth");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const hash = bcrypt.hashSync(req.body.password, 10);

  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const newUser = new User({
        email: req.body.email,
        password: hash,
        token: uid2(32),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      });

      newUser.save().then((user) => {
        res.json({
          result: true,
          token: user.token,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        });
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
      res.json({
        result: true,
        token: data.token,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.put("/", (req, res) => {
  console.log(req.body.token);
  User.updateOne(
    { token: req.body.token },
    {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      residenceCountry: req.body.residenceCountry,
      nationality: req.body.nationality,
      destinationCountry: req.body.destinationCountry,
      // profilePicture: req.body.profilePicture,
    }
  ).then((data) => {
    if (data.result) {
      res.json({ result: true });
    } else {
      res.json({ result: false, error: "error" });
    }
  });
});

router.post("/getInfos", checkToken, (req, res) => {
  User.findOne({ token: req.body.token }).then((data) => {
    res.json({ result: true, data });
  });
});

router.get("/allUsers", (req, res) => {
  User.find({}, "email firstname lastname")
    .then((users) => {
      if (users.length > 0) {
        res.json(users);
      } else {
        res.json({ result: false, error: "Aucun utilisateur trouvé" });
      }
    })
    .catch((error) => {
      console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    });
});


module.exports = router;
