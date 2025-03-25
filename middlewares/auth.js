const User = require('../models/users');

const checkToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.json({ result: false, error: 'No token provided' });
    }

    token = token.split(" ")[1] // .split permet de mettre "Bearer TOKEN" sous forme de tableau : ["Bearer", "TOKEN"], et on ne garde que le token avec [1]

    User.findOne({ token }).then(user => { // on vérifie si le token existe bien en BDD
        if (!user) {
            return res.json({ result: false, error: 'Invalid token' });
        }
        req.user = user;
        next(); // on passe au middleware suivant ou à la route selon
    });
};

module.exports = { checkToken };
