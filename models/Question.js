module.exports = (sequelize, DataTypes) => sequelize.define('question', {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    multiple_options: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});