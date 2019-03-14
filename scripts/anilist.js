const {Users} = require('../dbObjects');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

var allUsers = await Users.all({
  where: {
    anilist: {
      [Op.ne]: null
    }
  }
});

if (!allUsers) {
  return;
}

allUsers.forEach(user => {
  console.log(user);
});