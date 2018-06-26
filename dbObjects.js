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

var FaqInfo = sequelize.import('models/FaqInfo');
var Markdown = sequelize.import('models/Markdown');

Questions.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Questions.hasMany(Choices, {as: 'Choices'});
Choices.hasMany(Votes, {as: 'Votes'});
Votes.belongsTo(Users, {as: 'User', foreignKey: 'userId'});

FaqInfo.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Markdown.belongsTo(Users, {as: 'Users', foreignKey: 'author'});

module.exports = {Users, Questions, Choices, Votes, FaqInfo, Markdown}