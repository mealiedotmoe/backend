var express = require('express');
var router = express.Router();
const {BotToken} = require('../config');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(BotToken);

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Why are you hitting this route?' });
});

router.post('/ping', function(req, res, next) {
    if (!req.user || !req.user.admin) { return res.status(403).send('Admin account required') }
    const channel = client.channels.get('282640120388255744');
    if (!channel) { return res.status(500).send('Channel does not exist')}
    try {
        channel.send('this was sent from an api endpoint, how cool is that?');
        return res.status(200).send(':confettiball:')
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('internal error')
    }
});

module.exports = router;
