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
    if (!req.user.discord_id == '164546159140929538') { return res.status(403).send('Admin account required') }
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

router.post('/iam/', function(req, res, next) {
    try {
        const guild = client.guilds.get('148606162810568704');
        const role = guild.roles.find('name', req.body.roleName);
        const user = guild.members.get(req.user.discord_id);
        user.addRole(role, 'added from website');
        res.status(200).send("okayhand");
    }
    catch (err) {
        res.status(500).end();
    }
});

module.exports = router;
