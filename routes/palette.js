const express = require('express');
const router = express.Router();
const Canvas = require('canvas');

var jwt = require('jsonwebtoken');
const {Users, Palettes} = require('../dbObjects');
const {JWTSecret} = require('../config');

const canvasWidth = 550;
const canvasHeight = 650;

const bottomText = 'https://mealie.moe/palette';

Canvas.registerFont('./assets/fonts/Quicksand-Regular.ttf', {family: "Quicksand"});

const colorNames = [
    'Clover',
    'Member',
    'Active', 'Regular',
    'Contributor',
    'Addicted',
    'Insomniac',
    'No-Lifer',
    'Birthday'
];


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

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Why are you hitting this route?' });
});

/* GET all palettes */
router.get('/me/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user ) { return res.status(403).send('You must be logged in to an account use this feature').end(); }
    Palettes.find({
        where: {
            user_id: user.discord_id
        }
    }).then(myPalettes => {
        res.status(200).send(myPalettes);
    }).catch(err => {
        res.status(500).end()
    })
});

/* POST to create new faqinfo */
router.post('/me/', async function(req, res, next) {
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to an account to use this feature').end(); }
    Palettes.create({
        palette_name: req.body.palleteName,
        clover: req.body.cloverColor,
        member: req.body.memberColor,
        active: req.body.activeColor,
        regular: req.body.regularColor,
        contributor: req.body.contributorColor,
        addicted: req.body.addictedColor,
        insomniac: req.body.insomniacColor,
        nolifer: req.body.noliferColor,
        birthday: req.body.birthdayColor,
    }).then(newPallete => {
        newPallete.setUser(user);
        res.status(201).send(newPallete);
    });
});

router.get('/me/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user) { return res.status(401).send('You must be logged in to an account to use this feature').end(); }
    Palettes.findById(req.params.id).then(palette => {
        if (! palette) {
            res.status(500).send("Can't Find Palette");
        }
        if (!palette.user_id === user.id) {
            res.status(500).send("Can't Find Palette");
        }
        res.status(200).send(palette);
    })
});

router.put('/me/:id', async function(req, res, next){
    var user = await getUser(req);
    if (!user) { return res.status(403).send('You must be logged in to an account use this feature').end(); }
    Palettes.find({
        where: {
            user_id: user.id,
            id: req.params.id,
        }
    }).then(myPalette => {
        myPalette.update({
            palette_name: req.body.palleteName,
            clover: req.body.cloverColor,
            member: req.body.memberColor,
            active: req.body.activeColor,
            regular: req.body.regularColor,
            contributor: req.body.contributorColor,
            addicted: req.body.addictedColor,
            insomniac: req.body.insomniacColor,
            nolifer: req.body.noliferColor,
            birthday: req.body.birthdayColor,
        }).then(updatedPallete => {
            res.status(200).send(updatedPallete);
        });
    }).catch(err => {
        res.status(500).end()
    })
});

const wrapText = function(ctx, text) {
    let max_width  = 500;
    let fontSize =  35;
    ctx.font = '42px Quicksand';
    let lines      =  [];
    let width = 0, i, j;
    let result;
    while ( text.length ) {
        for( i=text.length; ctx.measureText(text.substr(0,i)).width > max_width; i-- );

        result = text.substr(0,i);
        if ( i !== text.length )
            for( j=0; result.indexOf(" ",j) !== -1; j=result.indexOf(" ",j)+1 );

        lines.push( result.substr(0, j|| result.length) );
        width = Math.max( width, ctx.measureText(lines[ lines.length-1 ]).width );
        text  = text.substr( lines[ lines.length-1 ].length, text.length );
    }
    for ( i=0, j=lines.length; i<j; ++i ) {
        ctx.fillText( lines[i], 30, 550 + fontSize + (fontSize+15) * i );
    }
};

router.post('/', function(req, res, next) {
    const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');


    const dataValues = req.body.colorValues;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '42px Quicksand';
    let height = 50;
    let counter = 0;
    try {
        colorNames.forEach(function (colorName) {
            const color = dataValues[counter];
            ctx.fillStyle = color;
            ctx.fillText(colorName, 30, height+ 50);
            ctx.fillText(color, 330, height+ 50);
            counter += 1;
            height += 50;
        });
        ctx.font = '38px Quicksand';
        ctx.fillStyle = '#fff';
        ctx.fillText(bottomText, 30, 600);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error in palette creation').end();
        return
    };
    res.setHeader('Content-Type', 'image/png');
    const stream = canvas.createPNGStream();
    stream.pipe(res);
});

module.exports = router;
