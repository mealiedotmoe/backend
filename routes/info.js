var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const {Users, Markdown} = require('../dbObjects');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

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
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Markdown.all().then(allMarkdown => {
        res.status(200).send(allMarkdown);
    }).catch(err => {
        res.status(500).end()
    })
});

/* POST to create new question */
router.post('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Markdown.create({
        title: req.body.infoTitle,
        slug: req.body.infoSlug,
        content: req.body.infoContent,
    }).then(newMarkdown => {
        newMarkdown.setUser(user);
        res.status(201).send(newMarkdown);
    }).catch(err => {
        res.status(500).end()
        console.error(err)
        console.log(req.body)
    });
});

router.get('/:slug', function(req, res, next){
    Markdown.find({where: {slug: req.params.slug}}).then(markdown => {
        if (! markdown) {
            res.status(500).send("Can't Find info");
        }
        res.status(200).send(markdown);
    })
});

router.put('/:slug', async function(req, res, next){
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Markdown.find({where: {slug: req.params.slug}}).then(markdown => {
        if (! markdown) {
            res.status(500).send("Can't Find Question");
        }
        markdown.update({
            title: req.body.infoTitle,
            slug: req.body.infoSlug,
            content: req.body.infoContent,
            last_edit: user.id,
        }).then(updatedMarkdown => {
            res.status(200).send(updatedMarkdown);
        }).catch(err => { 
            console.error(err);
            res.status(500).end()});
    });
});

module.exports = router;
 