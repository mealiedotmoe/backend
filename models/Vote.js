module.exports = (sequelize, DataTypes) => sequelize.define('vote', {
  }, {
    classMethods: {
        associate: function(models) {
            vote.hasOne(models.user);
        }
    }
});