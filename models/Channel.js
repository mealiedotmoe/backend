module.exports = (sequelize, DataTypes) => sequelize.define('palette', {
  channel_name: DataTypes.STRING,
  snowflake: DataTypes.BIGINT,
  users: DataTypes.JSONB,
  created_at: DataTypes.DATE,
});