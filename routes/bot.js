var express = require('express');
var router = express.Router();
const snekfetch = require('snekfetch');
const {BotToken} = require('../config');

const Discord = require('discord.js');
const client = new Discord.Client();

const colorLevels = [
    '-2-',
    '-5-',
    '-10-',
    '-15-',
    '-20-',
    '-25-',
    '-30-',
];

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

router.post('/colors/:number', async function(req, res, next) {
    try {
        const userLevel = await snekfetch.get(
            `https://www.danbo.space/api/v1/servers/148606162810568704/user/${req.user.discord_id}`
        );
        if (userLevel.statusCode !== 200) { return res.status(500).send("internal error").end(); }
        let userParse = JSON.parse(userLevel.text);
        let intNumber = parseInt(req.params.number);
        if (userParse['user']['level'] < intNumber || intNumber > 30) {
            return res.status(500).send('User not high enough level').end();
        }
        const guild = client.guilds.get('148606162810568704');
        const role = guild.roles.find('name', `-${intNumber}-`);
        const user = guild.members.get(req.user.discord_id);
        const removeRoles = await Promise.all(colorLevels.map(async level =>{
            return guild.roles.find('name', level);
        }));
        await user.removeRoles(removeRoles, 'Removing old color roles');
        await user.addRole(role, 'Adding new color role');
        res.status(200).send("ok_hand");
    }
    catch (err) {
        res.status(500).end();
    }
});

module.exports = router;
