module.exports = (sequelize, DataTypes) => sequelize.define('choice', {
    text: DataTypes.STRING,
    questionId: DataTypes.INTEGER,
});