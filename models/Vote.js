module.exports = (sequelize, DataTypes) => sequelize.define('vote', {
    choiceId: DataTypes.INTEGER
});