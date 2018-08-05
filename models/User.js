module.exports = function(sequelize, DataTypes) { 
  var User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discord_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    discord_token:{
      type: DataTypes.STRING,
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  }, {
    timestamps: false,
  });
  User.prototype.getInfo = function() {
    return {
      'username': this.username,
      'id': this.discord_id,
      'email': this.email,
      'experience': this.experience,
      'level': this.level,
      'admin': this.admin,
    };
  }
  User.prototype.getCleanInfo = function() {
    return {
      'username': this.username,
      'id': this.discord_id,
    };
  }
  return User;
}