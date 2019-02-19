const Sequelize = require('sequelize');
const {dbCreds} = require('./config');

const sequelize = new Sequelize(dbCreds.database, dbCreds.user, dbCreds.pass, {
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

var Palettes = sequelize.import('models/Palette');

var Channels = sequelize.import('models/Channel');
var Messages = sequelize.import('models/Message');

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
Palettes.belongsTo(Users, {as: 'User', foreignKey: 'user_id'});

Messages.belongsTo(Channels, {as: 'Message', foreignKey: 'channel_id'});

module.exports = {Users, Questions, Choices, Votes, FaqInfo, Markdown, Events, Games, Genres, Subscriptions, Palettes};