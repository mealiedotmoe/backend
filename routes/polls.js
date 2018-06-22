var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const btoa = require('btoa');
const fetch = require('node-fetch');
const {Users, Questions, Choices, Votes} = require('../dbObjects');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

const redirect = encodeURIComponent('https://www.animeirl.xyz/api/v1/discord/login/callback');

async function getUser(req) {
    if (!req.headers.authorization) {
        return false;
    }
    const token = req.headers.authorization.split(' ')[1];

    return await jwt.verify(token, jwtSecret, (err, decoded) =>{
        if(err) { return false; }
        const userId = decoded.sub;
        console.log(userId)
        return Users.findById(userId).then(user => {
            console.log(user)
            return user;
        }).catch(err => { return false; })
    })
}

/* GET all questions */
router.get('/', function(req, res, next) {
    Questions.findAndCountAll().then(questions => {
        res.send(JSON.stringify(questions));
    });
});

/* POST to create new question */
router.post('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Questions.create({
        text: req.body.pollName,
        multiple_options: req.body.enableMultipleAnswers,
    }).then(newQuestion => {
        newQuestion.setUser(user);
        req.body.choices.forEach((choice) => {
            Choices.create({
                text: choice.value,
            }).then(choice => {
                newQuestion.addChoices(choice)
            });
        });
        res.send(newQuestion);
    });
});

router.get('/polls/:id', function(req, res, next){
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        res.send(question);
    })
});

router.post('/polls/:id', function(req, res, next){
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        Vote.create({
            choiceId: question.id,
            user: req.body.user,
        })
        res.redirect(`questions/${req.params.id}/results`);
    })
});

router.get('/polls/:id/results', function(req, res, next) {
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        res.send(question);
    })
});


module.exports = router;
 