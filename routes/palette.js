const express = require('express');
const router = express.Router();
const Canvas = require('canvas');

const canvasWidth = 550;
const canvasHeight = 650;

const bottomText = 'https://mealie.moe/palette';

Canvas.registerFont('../assets/fonts/Quicksand-Regular.ttf', {family: "Quicksand"});

const colorNames = [
    'Clover',
    'Member',
    'Active',
    'Regular',
    'Contributor',
    'Addicted',
    'Insomniac',
    'No-Lifer',
    'Birthday'
];

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Why are you hitting this route?' });
});

const wrapText = function(ctx, text) {
    let max_width  = 500;
    let fontSize =  35;
    ctx.font = '42px Roboto';
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
        ctx.fillStyle = '#fff';
        wrapText(ctx, bottomText);
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
