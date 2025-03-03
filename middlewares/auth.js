const User = require('../models/users');

const checkToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.json({ result: false, error: 'No token provided' });
    }

    token = token.split(" ")[1]

    User.findOne({ token }).then(user => {
        if (!user) {
            return res.json({ result: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { checkToken };
