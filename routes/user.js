var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});
const Users = sequelize.import('../models/User');

/* GET all users */
router.get('/', function(req, res, next) {
    if (!req.user.admin) { res.status(401).end(); }
    Users.all().then(users =>{
        console.log(`Users: ${users}`)
        userJson = {}
        users.forEach(user => {
            console.log(user.getInfo());
            userJson[user.discord_id] = user.getInfo();
        })
        console.log(`UsersJson: ${usersJson}`)
        res.status(200).send(usersJson);
    });
});
    

router.get('/me', function(req, res, next){
    if (!req.user) { return res.status(404).send('No user found') };
    res.status(200).send(req.user.getInfo());
});

module.exports = router;
 