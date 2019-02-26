module.exports = (sequelize, DataTypes) => sequelize.define('message', {
  // This is going to be a big model for ease of use.
  // Author Info
  author_id: DataTypes.STRING,
  author_name: DataTypes.STRING,
  
  // Meta Info
  snowflake: DataTypes.BIGINT,
  channel_id: DataTypes.BIGINT,
  created_at: DataTypes.DATE,

  // Content Info
  content: DataTypes.JSONB
  
});