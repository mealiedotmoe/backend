var express = require('express');
const fetch = require('node-fetch');
var router = express.Router();

/* GET listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/history', async function(req, res, next) {
    const musicHistory = await fetch('http://144.217.162.175:1356/history').catch(err => {
      console.error(`Unable to get history: ${err}`);
    });
    if(!musicHistory) res.status(500).end();
    const jsonResponse = await musicHistory.json();
    console.log(musicHistory);
    res.status(200).send(jsonResponse['history']);
});

module.exports = router;
