module.exports = (sequelize, DataTypes) => 
    sequelize.define('markdown', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        author: {
            type: DataTypes.STRING,
        },
        last_edit: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        }
});