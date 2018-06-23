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

Questions.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Questions.hasMany(Choices, {as: 'Choices'});
Choices.hasMany(Votes, {as: 'Votes'});
Votes.belongsTo(Users, {as: 'User', foreignKey: 'userId'});

module.exports = {Users, Questions, Choices, Votes}