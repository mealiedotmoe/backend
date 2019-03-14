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

console.log(allUsers);