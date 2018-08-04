var express = require('express');
var router = express.Router();
const {Users, Games, Subscriptions} = require('../dbObjects');

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

router.get('/me/games', async function(req, res, next) {
    if (!req.user) { return res.status(403).send('User not logged in').end() }
    let retUser = req.user.getCleanInfo();
    retUser.games = await Subscriptions.findAll({
        where: {
            user_id: req.user.discord_id
        }
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
    res.status(200).send(retUser).end();
});

router.post('/me/games/:gameId', async function(req, res, next) {
    if (!req.user) { return res.status(404).send('No user found') }
    let foundGame = await Games.findById(req.params.gameId);
    if (!foundGame) { return res.status(404).send('Game not found') }
    Subscriptions.create({
        frequency: req.body.gameFrequency,
    }).then(sub => {
        sub.setUser(req.user.discord_id);
        sub.setGame(foundGame);
    }).then(createdSub => {
        res.status(200).send(createdSub).end();
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

router.get('/me', function(req, res, next){
    if (!req.user) { return res.status(404).send('No user found') }
    res.status(200).send(req.user.getInfo());
});
    
router.put('/:id', function(req, res, next) {
    if (!req.user.admin) { res.status(401).end(); }
    Users.findById(req.params.id).then(user => {
        if (!user) { return res.status(500).send('Can not find user.').end() }
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
});

router.get('/:id/games', function(req, res, next) {
    Users.findById(req.params.id).then(async user => {
        if (!user) { return res.status(500).send('Can not find user.').end() }
        user.games = await Subscriptions.findAll({
            where: {
                user_id: user.discord_id
            }
        });
        res.status(200).send(user).end();
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

router.post('/:id/games/:gameId', async function(req, res, next) {
    if (!req.user || !req.user.admin) {
        return res.status(403).send('You need to be logged into an admin account to use this feature')
    }
    let foundGame = await Games.findById(req.params.gameId);
    let targetUser = await Users.findById(req.params.id);
    if (!foundGame) { return res.status(404).send('Game not found').end() }
    if (!targetUser) { return res.status(404).send('User not found').end() }
    Subscriptions.create({
        frequency: req.body.gameFrequency,
    }).then(sub => {
        sub.setUser(targetUser.discord_id);
        sub.setGame(foundGame);
    }).then(createdSub => {
        res.status(200).send(createdSub).end();
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

module.exports = router;
 