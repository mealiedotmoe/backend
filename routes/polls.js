var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
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
        return Users.findById(userId).then(user => {
            return user;
        }).catch(err => { return false; })
    })
}

/* GET all questions */
router.get('/', async function(req, res, next) {
    Questions.findAndCountAll().then(questions => {
        var tempUser = await question.getUser();
        question.author = tempUser.getCleanInfo();
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

router.get('/:id', function(req, res, next){
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        question.getChoices().then(allChoices => {
            question.dataValues.choices = allChoices;
            res.send(question);
        });
    })
});

router.post('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        if (!question.multiple_options) {
            Choices.findById(req.body.choices[0]).then(choice =>{
                if (!choice) {return res.status(500).send("Couldn't find choice")}
                allResponses = question.responses;
                if (allResponses.includes(`${user.id}`)) {
                    res.status(500).send('User already voted');
                }
                Votes.create({
                    choiceId: choice.id
                }).then(vote => {
                    vote.setUser(user);
                    choice.addVotes(vote);
                });
                allResponses.push(user.id);
                question.update(
                    {responses: allResponses}
                ).then(() =>{
                    res.status(200).end();
                });
                
            });
        } else {
            req.body.choices.forEach(id =>{
                Choices.findById(id).then(choice =>{
                    if (!choice) {return res.status(500).send("Couldn't find choice")}
                    Votes.create({
                        choiceId: choice.id
                    }).then(vote => {
                        vote.setUser(user);
                        choice.addVotes(vote);
                    });
                }
            )});  
            res.status(200).end();
        }
    })
});

router.put('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        console.log(req.body);
        question.update({
            text: req.body.pollTitle,
            multiple_options: req.body.pollMultipleOptions,
            admin_abuse: req.body.adminAbuse,
        }).then(updatedPoll => {
            res.status(200).send(updatedPoll);
        }).catch(err => { 
            console.log(err);
            res.status(500).end() 
        });
    }).catch(err => { 
        console.log(err);
        res.status(500).end() 
    });
});

router.delete('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        console.log(req.body);
        question.delete().then(() => {
            res.status(200).end();
        }).catch(err => { 
            console.log(err);
            res.status(500).end() 
        });
    }).catch(err => { 
        console.log(err);
        res.status(500).end() 
    });
});

router.put('/choice/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Choices.findById(req.params.id).then(choice => {
        if (!choice) {
            res.status(500).send("Can't Find choice");
        }
        choice.update({
            text: req.body.choiceTitle,
        }).then(updatedChoice => {
            res.status(200).send(updatedChoice);
        }).catch(err => { 
            console.log(err);
            res.status(500).end() 
        });
    }).catch(err => { 
        console.log(err);
        res.status(500).end() 
    });
});

router.delete('/choice/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Choices.findById(req.params.id).then(choice => {
        if (!choice) {
            res.status(500).send("Can't Find Choice");
        }
        console.log(req.body);
        choice.delete().then(() => {
            res.status(200).end();
        }).catch(err => { 
            console.log(err);
            res.status(500).end() 
        });
    }).catch(err => { 
        console.log(err);
        res.status(500).end() 
    });
});

router.get('/:id/results', function(req, res, next) {
    Questions.findById(req.params.id).then(question => {
        if (! question) {
            res.status(500).send("Can't Find Question");
        }
        question.getChoices().then(choices => {
            choices = choices.map(async choice => {
                choice.dataValues.votes = await Votes.count({ where: {choiceId: choice.id }});
                return choice
            })
            Promise.all(choices).then(choicesDone => {
                question.dataValues.choices = choicesDone;
                res.send(question);
            })
            
        });
    })
});


module.exports = router;
 