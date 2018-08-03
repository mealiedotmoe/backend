module.exports = (sequelize, DataTypes) => 
    sequelize.define('question', {
        text: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
        },
        multiple_options: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        responses: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        admin_abuse: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    });