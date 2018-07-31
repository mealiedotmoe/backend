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
        res.json(userList);
    });
});
    
router.put('/:id', function(req, res, next) {
    if (!req.user.admin) { res.status(401).end(); }
    Users.findById(req.params.id).then(user => {
        if (!user) { res.status(500).send('Can not find user.')}
        user.update({
            admin: req.body.userAdmin,
        }).then(updatedUser => {
            res.status(200).send(updatedUser);
        }).catch(err => {
            console.log(err);
            res.status(500).end()
        });
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    })
}) ;

router.get('/me', function(req, res, next){
    if (!req.user) { return res.status(404).send('No user found') }
    res.status(200).send(req.user.getInfo());
});

module.exports = router;
 