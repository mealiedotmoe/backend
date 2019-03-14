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
  
  allUsers.forEach(user => {
    console.log(user.anilist);
  });
})

