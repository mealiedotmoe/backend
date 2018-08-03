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
    
router.put('/:id', function(req, res, next) {
    if (!req.user.admin) { res.status(401).end(); }
    Users.findById(req.params.id).then(user => {
        if (!user) { res.status(500).send('Can not find user.').end() }
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
        if (!user) { res.status(500).send('Can not find user.').end() }
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

router.post('/:id/games/:game', async function(req, res, next) {
    if (!req.user || !req.user.admin) {
        return res.status(403).send('You need to be logged into an admin account to use this feature')
    }
    let foundGame = await Games.findById(req.params.game);
    let targetUser = await Users.findById(req.params.id);
    if (!foundGame) { return res.status(404).send('Game not found').end() }
    if (!targetUser) { return res.status(404).send('User not found').end() }
    Subscriptions.create().then(sub => {
        sub.setUser(targetUser);
        sub.setGame(foundGame);
    }).then(createdSub => {
        res.status(200).send(createdSub).end();
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

router.get('/me/games', async function(req, res, next) {
    let user = req.user;
    if (!user) { res.status(500).send('Can not find user.').end() }
    user.games = await Subscriptions.findAll({
        where: {
            user_id: user.discord_id
        }
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
    res.status(200).send(user).end();
});

router.post('/me/games/:game', async function(req, res, next) {
    if (!req.user) { return res.status(404).send('No user found') }
    let foundGame = await Games.findById(req.params.game);
    if (!foundGame) { return res.status(404).send('Game not found') }
    Subscriptions.create().then(sub => {
        sub.setUser(req.user);
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

module.exports = router;
 