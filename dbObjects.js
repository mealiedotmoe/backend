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
var Events = sequelize.import('models/Event');
var Markdown = sequelize.import('models/Markdown');

var Games = sequelize.import('models/Game');
var Genres = sequelize.import('models/GameGenre');
var Subscriptions = sequelize.import('models/Subscription');

Subscriptions.belongsTo(Games, {as: 'Game', foreignKey: 'game_id'});
Subscriptions.belongsTo(Users, {as: 'User', foreignKey: 'user_id'});

Games.belongsTo(Genres, {as: 'Genre', foreignKey: 'genre_id', });
Games.hasMany(Subscriptions, {foreignKey: 'game_id', onDelete: 'cascade', hooks: 'true'});

Questions.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Questions.hasMany(Choices, {as: 'Choices', onDelete: 'cascade', hooks: 'true'});
Choices.hasMany(Votes, {as: 'Votes', onDelete: 'cascade', hooks: 'true'});
Votes.belongsTo(Users, {as: 'User', foreignKey: 'userId'});

FaqInfo.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Events.belongsTo(Users, {as: 'User', foreignKey: 'author'});
Markdown.belongsTo(Users, {as: 'User', foreignKey: 'author'});

module.exports = {Users, Questions, Choices, Votes, FaqInfo, Markdown, Events, Games, Genres, Subscriptions};