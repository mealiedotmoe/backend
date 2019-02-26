module.exports = (sequelize, DataTypes) => sequelize.define('channel', {
  channel_name: DataTypes.STRING,
  snowflake: DataTypes.BIGINT,
  users: DataTypes.JSONB,
  created_at: DataTypes.DATE,
});