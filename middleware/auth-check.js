const jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const Sequelize = require('sequelize');

const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

const Users = sequelize.import('../models/User');

module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).end();
    }

    const token = req.headers.authorization.split(' ')[1];

    return jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) { return res.status(401).end(); }

        const userId = decoded.sub;

        return Users.findById(userId).then(user =>{
            if (!user) {
                return res.status(401).end();
            }
            req.user = user;
            return next();
        }).catch(err => {
            return res.status(401).end();
        });
    });
};