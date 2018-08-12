var express = require('express');
var router = express.Router();
const {Users, Games, Subscriptions} = require('../dbObjects');
const fetch = require('node-fetch');
const anilistQuery = '{Viewer {id name}}';

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

router.get('/me', function(req, res, next){
    if (!req.user) { return res.status(404).send('No user found') }
    res.status(200).send(req.user.getInfo());
});

router.put('/me', function(req, res, next) {
    if (!req.user) { res.status(401).end(); }
    req.user.update({
        birthday: req.body.userBirthday,
        waifu: req.body.userWaifu,
    }).then(updatedUser => {
        res.status(200).send(updatedUser);
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

router.post('/me/anilist', async function(req, res, next) {
    const optionsToken = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' +  req.body.accessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: anilistQuery,
        })
    };
    const anilistResp = await fetch('https://graphql.anilist.co', optionsToken);
    if (!anilistResp) { return res.send(500).send('oops error occured').end(); }
    const parsedResp = await anilistResp.json();
    console.log(parsedResp);
    const userName = parsedResp['data']['Viewer']['name'];
    const updatedUser = await req.user.update({
        anilist: `https://anilist.co/user/${userName}/`,
    });
    return res.status(200).send(updatedUser).end();
});

router.get('/me/games', async function(req, res, next) {
    if (!req.user) { return res.status(403).send('User not logged in').end() }
    let retUser = req.user.getCleanInfo();
    let allGames = await Subscriptions.findAll({
        where: {
            user_id: req.user.discord_id
        }
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
    if (!allGames) {
        res.status(200).send("{}").end();
    }
    retUser.games = await Promise.all(allGames.map(async game => {
        let gameObj = await Games.findById(game.game_id);
        let retObj = {};
        retObj['id'] = gameObj['id'];
        retObj['title'] = gameObj['title'];
        retObj['frequency'] = game['frequency'];
        return retObj;
    }));
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

router.put('/me/games/:id', async function(req, res, next) {
    if (!req.user) { return res.status(404).send('No user found') }
    let foundGame = await Games.findById(req.params.gameId);
    if (!foundGame) { return res.status(404).send('Game not found') }
    Subscriptions.findById(req.params.id).then(subInfo => {
        if (! subInfo) {
            res.status(500).send("Can't Find subscription");
        }
        subInfo.update({
            frequency: req.body.gameFrequency,
        }).then(updatedSub => {
            res.status(200).send(updatedSub).end();
        }).catch(err => { res.status(500).end()});
    });
});

router.delete('/me/games/:id', async function(req, res, next){
    if (!req.user) { return res.status(403).send('You must be logged in to use this feature').end(); }
    Subscriptions.findById(req.params.id).then(subInfo => {
        if (! subInfo) {
            res.status(500).send("Can't Find subscription");
        }
        subInfo.delete().then(() => {
            res.status(200).end();
        }).catch(err => { res.status(500).end()});
    });
});
    
router.put('/:id', function(req, res, next) {
    if (!req.user.admin) { res.status(401).end(); }
    Users.findById(req.params.id).then(user => {
        if (!user) { return res.status(500).send('Can not find user.').end() }
        user.update({
            admin: req.body.userAdmin,
            birthday: req.body.userBirthday,
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

router.get('/:id', function(req, res, next) {
    Users.findById(req.params.id).then(async user => {
        if (!user) { return res.status(500).send('Can not find user.').end() }
        res.status(200).send(user).end();
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
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

router.put('/:id/games/:gameId', async function(req, res, next) {
    if (!req.user || !req.user.admin) {
        return res.status(403).send('You need to be logged into an admin account to use this feature')
    }
    let targetUser = await Users.findById(req.params.id);
    if (!targetUser) { return res.status(404).send('User not found').end() }
    let foundGame = await Games.findById(req.params.gameId);
    if (!foundGame) { return res.status(404).send('Game not found') }
    Subscriptions.find({
        where: {
            game_id: req.params.gameId,
            user_id: targetUser.discord_id,
        }
    }).then(subInfo => {
        if (! subInfo) {
            res.status(500).send("Can't Find subscription");
        }
        subInfo.update({
            frequency: req.body.gameFrequency,
        }).then(updatedSub => {
            res.status(200).send(updatedSub).end();
        }).catch(err => { res.status(500).end()});
    });
});

router.delete('/me/games/:gameId', async function(req, res, next){
    if (!req.user || !req.user.admin) {
        return res.status(403).send('You need to be logged into an admin account to use this feature')
    }
    let targetUser = await Users.findById(req.params.id);
    if (!targetUser) { return res.status(404).send('User not found').end() }
    Subscriptions.find({
        where: {
            game_id: req.params.gameId,
            user_id: targetUser.discord_id,
        }
    }).then(subInfo => {
        if (! subInfo) {
            res.status(500).send("Can't Find subscription");
        }
        subInfo.delete().then(() => {
            res.status(200).end();
        }).catch(err => { res.status(500).end()});
    });
});

module.exports = router;
 