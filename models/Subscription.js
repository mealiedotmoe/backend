module.exports = (sequelize, DataTypes) => sequelize.define('subscription', {
    game_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});