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
        userList = []
        users.forEach(user => {
            userList.push(JSON.stringify(user.getInfo()));
        });
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json(userList);
    });
});
    

router.get('/me', function(req, res, next){
    if (!req.user) { return res.status(404).send('No user found') };
    res.status(200).send(req.user.getInfo());
});

module.exports = router;
 