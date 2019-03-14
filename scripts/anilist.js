const {Users} = require('../dbObjects');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

var allUsers = Users.all({
  where: {
    anilist: {
      [Op.ne]: null
    }
  }
});

allUsers.forEach(user => {
  console.log(user);
});