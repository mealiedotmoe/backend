module.exports = (sequelize, DataTypes) => sequelize.define('game', {
    title: DataTypes.STRING,
    genre_id: DataTypes.INTEGER,
});