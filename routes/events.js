var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const {Users, Events} = require('../dbObjects');
const {EventHook, JWTSecret} = require('../config');
const Webhook = require("webhook-discord");
const Hook = new Webhook(EventHook);

async function getUser(req) {
    if (!req.headers.authorization) {
        return false;
    }
    const token = req.headers.authorization.split(' ')[1];

    return await jwt.verify(token, JWTSecret, (err, decoded) =>{
        if(err) { return false; }
        const userId = decoded.sub;
        return Users.findById(userId).then(user => {
            return user;
        }).catch(err => { return false; })
    })
}

router.get('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Events.all().then(async allEvents => {
        let allUsers = await Users.all();
        allUsers = await Promise.all(allUsers.map(async user => {
            return user.getCleanInfo();
        }));
        res.status(200).send({'events': allEvents, 'users': allUsers});
    }).catch(err => {
        res.status(500).end()
    })
});

router.post('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Events.create({
        title: req.body.eventTitle,
        date: req.body.eventDate,
        type: req.body.eventType,
        description: req.body.eventDescription,
    }).then(newEvents => {
        newEvents.setUser(user);
        if (req.body.postEvent) {
            Hook.custom("Events", newEvents.description, newEvents.title, "#aec6cf", req.body.postImage);
        }
        res.status(201).send(newEvents);
    });
});

router.get('/id/:id', function(req, res, next){
    Events.findById(req.params.id).then(eventInfo => {
        if (! eventInfo) {
            res.status(500).send("Can't Find info");
        }
        res.status(200).send(eventInfo);
    })
});

router.get('/date/:date', function(req, res, next){
    Events.findAll({where: {
        date: req.params.date
    }}).then(eventInfo => {
        if (! eventInfo) {
            res.status(500).send("Can't Find info");
        }
        res.status(200).send(eventInfo);
    })
});

router.put('/:id', async function(req, res, next){
    let user = await getUser(req);
    if (!user || !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Events.findById(req.params.id).then(eventInfo => {
        if (! eventInfo) {
            res.status(500).send("Can't Find Info");
        }
        eventInfo.update({
            title: req.body.eventTitle,
            date: req.body.eventDate,
            type: req.body.eventType,
            description: req.body.eventDescription,
        }).then(updatedEvent => {
            res.status(200).send(updatedEvent);
        }).catch(err => { res.status(500).end()});
    });
});

module.exports = router;
