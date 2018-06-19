var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const btoa = require('btoa');
const fetch = require('node-fetch');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});
const Questions = sequelize.import('../models/Question');
const Choices = sequelize.import('../models/Choice');
const Votes = sequelize.import('../models/Vote');

const redirect = encodeURIComponent('https://www.animeirl.xyz/api/v1/discord/login/callback');

/* GET all questions */
router.get('/', function(req, res, next) {
    Questions.findAndCountAll().then(questions => {
        res.send(JSON.stringify(questions));
    });
});

/* POST to create new question */
router.post('/', async function(req, res, next) {
    Questions.create({
        text: req.body.questionText,
        multiple_options: req.body.multiple_options,
    }).then(newQuestion => {
        req.body.newChoices.forEach((choice) => {
            Choices.create({
                questionId: newQuestion.id,
                text: choice.text,
            });
        });
        res.send(newQuestion);
    })
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
 