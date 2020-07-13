var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const {Users, Messages, Channels} = require('../dbObjects');
const {JWTSecret} = require('../config');


async function getUser(req) {
    if (!req.headers.authorization) {
        return false;
    }
    const token = req.headers.authorization.split(' ')[1];

    return await jwt.verify(token, JWTSecret, (err, decoded) =>{
        if(err) { return false; }
        const userId = decoded.sub;
        return Users.findById(userId).then(user => {
            return user;
        }).catch(err => { return false; })
    })
}

router.get('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Channels.all().then(async allChannels => {
        res.status(200).send({'Channels': allChannels});
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    })
});

router.post('/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Channels.create({
        channel_name: req.body.channelName,
        created_at: req.body.createdDate,
        snowflake: req.body.snowflake,
        users: req.body.users,
    }).then(newChannels => {
        res.status(201).send(newChannels);
    });
});

router.get('/:id/messages', async function(req, res, next){
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to use this feature').end(); }
    Channels.find({
        where: {
            "snowflake": req.params.id
        }}).then(channelInfo => {
        if (! channelInfo) {
            res.status(500).send("Can't Find channel");
        }
        var offset = 0
        if (req.query.offset) {
            offset = req.query.offset;
        }
        Messages.findAll({
            where: {
                channel_id: channelInfo.snowflake
            },
            order: [[
                'snowflake', 'DESC'
            ]],
            offset: offset,
            limit: 50
        }).then(messages => {
            res.status(200).send({
                "channel": channelInfo,
                "messages": messages
            });
        });  
    })
});

router.put('/:id', async function(req, res, next){
    let user = await getUser(req);
    if (!user || !user.admin) { return res.status(403).send('You must be logged in to an admin account use this feature').end(); }
    Channels.find({
        where: {
            "snowflake": req.params.id
        }}).then(channelInfo => {
        if (! channelInfo) {
            res.status(500).send("Can't Find Info");
        }
        channelInfo.update({
            channel_name: req.body.channelName,
            created_at: req.body.createdDate,
            snowflake: req.body.snowflake,
            users: req.body.users,
        }).then(updatedchannel => {
            res.status(200).send(updatedchannel);
        }).catch(err => {
            console.log(err);
            res.status(500).end()
        });
    });
});

router.post('/:id/messages', async function(req, res, next) {
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Channels.find({
        where: {
            "snowflake": req.params.id
        }}).then(channel => {
        if (! channel) {
            res.status(500).send("Can't Find channel");
        }
        var allMessages = req.body.messages.map(message => {
            return Messages.create({
                author_id: message.author.id,
                author_name: message.author.username,
                snowflake: message.id,
                channel_id: channel.snowflake,
                created_at: message.timestamp,
                content: {
                    text: message.content,
                    attachments: message.attachments,
                    embeds: message.embeds,
                    attributes: {
                        is_pinned: message.pinned,
                        mentions: message.mentions
                    }
                }
            })
        });
        Promise.all(allMessages).then(allMessages => {
            res.status(200).send(allMessages);
        })
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

router.delete('/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user || !user.admin) { return res.status(401).send('You must be logged in to an admin account use this feature').end(); }
    Channels.find({
        where: {
            "snowflake": req.params.id
        }}).then(channel => {
        if (! channel) {
            res.status(500).send("Can't Find channel");
        }
        Messages.destroy({
            where: {
                channel_id: channel.snowflake
            }
        });
        channel.destroy().then(() => {
            res.status(200).end();
        }).catch(err => {
            console.log(err);
            res.status(500).end()
        });
    }).catch(err => {
        console.log(err);
        res.status(500).end()
    });
});

module.exports = router;