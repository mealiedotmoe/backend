var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const {Users, FaqInfo} = require('../dbObjects');

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

/* GET all faqinfos */
router.get('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    FaqInfo.all().then(allFaqInfo => {
        res.status(200).send(allFaqInfo);
    }).catch(err => {
        res.status(500).end()
    })
});

/* POST to create new faqinfo */
router.post('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(401).send('You must be logged in to an admin account to use this feature').end(); }
    FaqInfo.create({
        title: req.body.faqTitle,
        content: req.body.faqContent,
    }).then(newFaqInfo => {
        newFaqInfo.setUser(user);
        res.status(201).send(newFaqInfo);
    });
});

router.get('/:id', function(req, res, next){
    FaqInfo.findById(req.params.id).then(faqinfo => {
        if (! faqinfo) {
            res.status(500).send("Can't Find info");
        }
        res.status(200).send(faqinfo);
    })
});

router.put('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    FaqInfo.findById(req.params.id).then(faqinfo => {
        if (! faqinfo) {
            res.status(500).send("Can't Find Info");
        }
        faqinfo.update({
            title: req.body.faqTitle,
            content: req.body.faqContent,
        }).then(updatedMarkdown => {
            res.status(200).send(updatedMarkdown);
        }).catch(err => { res.status(500).end()});
    });
});

module.exports = router;
 