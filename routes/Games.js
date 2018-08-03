var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtSecret = 'yourtokenhere';
const {Users, Games, Genres} = require('../dbObjects');

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

router.get('/', async function(req, res, next) {
    var user = await getUser(req);
    Games.all().then(allGames => {
        allGames = allGames.map(async game => {
            let userList = await game.getUsers();
            game.users = userList.map(user => {
                return user.getCleanInfo();
            });
            game.genre = await game.getGenre().name;
        });
        res.status(200).send(allGames);
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    })
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
    Games.create({
        title: req.body.eventTitle,
    }).then(newGame => {
        newGame.setGenre(gameGenre);
        res.status(201).send(newGame);
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