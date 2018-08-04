var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const {Users, Games, Genres, Subscriptions} = require('../dbObjects');

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

router.get('/', async function(req, res, next) {
    let user = await getUser(req);
    if (!user) { return res.status(403).send('You must be logged in to an account to use this feature').end(); }
    let allGames = await Games.all();
    let subList = await Subscriptions.findAll({
        where: {
            game_id: game.id,
        },
    });
    let gamesPlusSubs = await Promise.all(allGames.map(async game => {
        game.users = await Promise.all(subList.map(async sub => {
            let subUser = await Users.findById(sub.user_id);
            return subUser.getCleanInfo();
        }));
        game.genre = await Genres.findById(game.genre_id);
        return game;
    }));
    res.status(200).send(gamesPlusSubs).end();
});

router.get('/list', async function(req, res, next) {
    let user = await getUser(req);
    if (!user) { return res.status(403).send('You must be logged in to an account to use this feature').end(); }
    let gamesList = await Games.all().catch(err => {
        console.log(err);
        res.status(500).end();
    });
    res.status(200).send(gamesList).end();
});

router.post('/', async function(req, res, next) {
    let user = await getUser(req);
    if (!user || !user.admin ) {
        return res.status(401).send('You must be logged in to an admin account to use this feature').end();
    }
    let gameGenre = await Genres.findOrCreate({
        where: {
            name: req.body.genreName,
        },
    });
    // If gameGenre was newly created, select only game genre object
    if (gameGenre[1]) {
        gameGenre = gameGenre[0];
    }
    Games.create({
        title: req.body.gameTitle,
    }).then(newGame => {
        newGame.setGenre(gameGenre);
        res.status(201).send(newGame);
    });
});

router.post('/genres/', async function(req, res, next) {
    let user = await getUser(req);
    if (!user || !user.admin ) {
        return res.status(401).send('You must be logged in to an admin account to use this feature').end();
    }
    Genres.create({
        name: req.body.genreName,
    }).then(newGame => {
        res.status(201).send(newGame);
    });
});

router.put('/genres/:id', async function(req, res, next) {
    let user = await getUser(req);
    if (!user || !user.admin ) {
        return res.status(401).send('You must be logged in to an admin account to use this feature').end();
    }
    Games.findById(req.params.id).then( genreInfo => {
        if (!genreInfo) {
            res.status(500).send("Can't Find Genre");
        }
         genreInfo.update({
            title: req.body.genreName,
        }).then(updatedGenre => {
            res.status(200).send(updatedGenre);
        }).catch(err => { res.status(500).end()});
    });
});

router.put('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user && !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Games.findById(req.params.id).then(gameInfo => {
        if (! gameInfo) {
            res.status(500).send("Can't Find Game");
        }
        gameInfo.update({
            title: req.body.gameTitle
        }).then(async halfUpdated => {
            let gameGenre = await Genres.findOrCreate({
                where: {
                    name: req.body.genreName,
                },
            });
            if (halfUpdated.getGenre() !== gameGenre) {
                halfUpdated.setGenre(gameGenre);
            }
        }).then(updatedGame => {
            res.status(200).send(updatedGame);
        }).catch(err => { res.status(500).end()});
    });
});

module.exports = router;