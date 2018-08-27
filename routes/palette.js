const express = require('express');
const router = express.Router();
const Canvas = require('canvas');

const canvasWidth = 550;
const canvasHeight = 900;

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    context.fillStyle = '#FFFFFF';
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Why are you hitting this route?' });
});

router.post('/', function(req, res, next) {
    const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const colorNames = [
        'Clover',
        'Member',
        'Active',
        'Regular',
        'Contributor',
        'Addicted',
        'Insomniac',
        'No-Lifer',
    ];
    const dataValues = req.body.colorValues;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '46px Roboto';

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
        wrapText(ctx, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', height + 400, 30, 490, 40);
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
