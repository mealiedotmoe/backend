var express = require('express');
const fetch = require('node-fetch');
var router = express.Router();

/* GET listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/history', async function(req, res, next) {
    const musicHistory = await fetch('http://144.217.162.175:1356/history',
    {
      method: 'GET'
    }).catch(err => {
      console.error(`Unable to get user: ${err}`);
    });
    if(!musicHistory) res.status(500).end();
    res.status(200).send(musicHistory.json);
});

module.exports = router;
