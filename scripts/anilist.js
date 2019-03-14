const {Users} = require('../dbObjects');

var allUsers = Users.all({
  where: {
    anilist: {
      [Op.ne]: null
    }
  }
});

console.log(allUsers);