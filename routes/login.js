var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const btoa = require('btoa');
const fetch = require('node-fetch');
const {JWTSecret} = require('../config');
const { Users } = require('../dbObjects');

const CLIENT_ID = "379731370735566849";
const CLIENT_SECRET = "OZooKYkRhbFahfetM5Qi6gUA08xQU3sS";
const redirect = encodeURIComponent('https://www.animeirl.xyz/api/v1/discord/login/callback');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds`);
});

router.put('/reauth/:id')
router.get('/callback', async function(req, res, next) {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    });
  const json = await response.json();
  const temp_user = await fetch('https://discordapp.com/api/users/@me', 
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${json.access_token}`
      }
    }).catch(err => {
      console.error(`Unable to get user: ${err}`);
    });
  var discord_user = await temp_user.json();
  var db_user = await Users.upsert({
    username: `${discord_user.username}`,
    discord_id: `${discord_user.id.toString()}`,
    discord_token: `${discord_user.access_token}`,
  }, {returning: true}).catch(err => {
    console.error(`Unable to store user: ${err}`);
  });
  user = await db_user[0].dataValues;
  var claims = {
    "sub": `${user.discord_id}`,
    "exp": json.expires_in,
    "avatarURL": `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`,
    "username": `${user.username}`,
    "isAdmin": `${user.admin}`,
  };
  var token = jwt.sign(claims, JWTSecret);
  res.cookie('user', token, {secure: true});
  res.redirect('https://www.animeirl.xyz/callback');
});


module.exports = router;
