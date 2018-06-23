module.exports = (sequelize, DataTypes) => 
    sequelize.define('question', {
        text: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        UserDiscordId: {
            type: DataTypes.STRING,
        },
        multiple_options: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        admin_abuse: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    });