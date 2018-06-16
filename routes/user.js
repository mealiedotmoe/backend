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

/* GET all questions */
router.get('/', function(req, res, next) {
    res.redirect('/dash');
});

router.get('/:id', function(req, res, next){
    Users.findById(req.params.id).then(user => {
        if (! user) {
            res.status(404).send("Can't Find Question");
        }
        res.status(200).send(user);
    })
});

module.exports = router;
 