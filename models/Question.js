module.exports = (sequelize, DataTypes) => sequelize.define('question', {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    multiple_options: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
  }, {
    classMethods: {
        associate: function(models) {
            question.hasMany(models.Choice, {as: 'choices'});
            question.hasOne(models.User);
        }
    }
});