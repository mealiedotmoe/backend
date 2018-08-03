module.exports = (sequelize, DataTypes) => 
    sequelize.define('faqinfo', {
        title: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
        },
        last_edit: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    });