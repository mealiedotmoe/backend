const {Users} = require('../dbObjects');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

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
    var username = user.anilist.substr(24, user.anilist.length -1);
    return username;
  });

  console.log(justUsernames);
})

