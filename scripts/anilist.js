const {Users} = require('../dbObjects');
const {GetUserList} = require('./queries/GetUserList');
const Sequelize = require('sequelize');
const fetch = require("node-fetch");

const Op = Sequelize.Op;

var remaining_requests = 60;
var request_reset = null;

Users.all({
  where: {
    anilist: {
      [Op.ne]: null
    }
  }
}).then(allUsers => {
  if (!allUsers) {
    return;
  }
  
  var justUsernames = allUsers.map(user => {
    var username = user.anilist.slice(24, -1);
    return username;
  });

  console.log(justUsernames);

  var allLists = justUsernames.map(username => {
    getList(username).then(list => {
      return list
    });
  });
  console.log(allLists[0]);
  return;
})

async function getList(username) {
  // Definitely just stole this from the anilist API example
  // Leaving the comments in cause they are useful
  // Here we define our query as a multi-line string
  // Storing it in a separate .graphql/.gql file is also possible
  var query = GetUserList;
  // Define our query variables and values that will be used in the query request
  var variables = {
      username: username
  };
  // Define the config we'll need for our Api request
  var url = 'https://graphql.anilist.co',
      options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              query: query,
              variables: variables
          })
      };
  if (remaining_requests < 3) {
    console.log("Oops too fast");
    var ts = Math.round((new Date()).getTime() / 1000);
    var refresh = request_reset - ts;
    while (refresh > 1){
      console.log('We have hit the Anilist API rate-limit, waiting ' + refresh + ' seconds to continue')
      await sleep(1000);
      refresh--;
    }
  }
  // Make the HTTP Api request
  const response = await fetch(url, options);
  const json = await this.handleResponse(response);
  remaining_requests = response.headers.get('X-RateLimit-Remaining');
  request_reset = response.headers.get('X-RateLimit-Reset');
  return json.data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
