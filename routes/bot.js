var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const {JWTSecret} = require('../config');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login('token');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Why are you hitting this route?' });
});

module.exports = router;
