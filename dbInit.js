const Sequelize = require('sequelize');

const sequelize = new Sequelize('mealiedb', 'mealie', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

var Users = sequelize.import('models/User');
var Questions = sequelize.import('models/Question');
var Choices = sequelize.import('models/Choice');
var Votes = sequelize.import('models/Vote');

Questions.belongsTo(Users, {as: 'User'});
Questions.hasMany(Choices, {as: 'Choices'});
Choices.hasMany(Votes, {as: 'Votes'});
Votes.belongsTo(Users, {as: 'Users'})

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
  console.log('Database synced');
  sequelize.close();
}).catch(console.error);