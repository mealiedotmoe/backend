var Vote = sequelize.define('Vote', {
    ip: DataTypes.STRING,
    user: DataTypes.STRING,
    // ... define model fields here
  }, {
    classMethods: {
      associate: function(models) {
        // define relationships here
      }
        // ... define class methods here
    }
  });