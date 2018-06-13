module.exports = (sequelize, DataTypes) => sequelize.define('question', {
    text: {
      type: DataTypes.STRING,
    },
  }, {
    classMethods: {
        associate: function(models) {
            question.hasMany(models.Choice, {as: 'choices'});
        }
    }
});