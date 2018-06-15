module.exports = (sequelize, DataTypes) => sequelize.define('choice', {
    text: DataTypes.STRING,
  }, {
    classMethods: {
        associate: function(models) {
            question.hasMany(models.Vote, {as: 'votes'});
        }
    }
});