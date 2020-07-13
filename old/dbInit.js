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
var Markdown = sequelize.import('models/Markdown');
var Events = sequelize.import('models/Event');
var Games = sequelize.import('models/Game');
var Subscriptions = sequelize.import('models/Subscription');
var Genres = sequelize.import('models/GameGenre');
var Palettes = sequelize.import('models/Palette');
var Channels = sequelize.import('models/Channel');
var Messages = sequelize.import('models/Message');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
  console.log('Database synced');
  sequelize.close();
}).catch(console.error);