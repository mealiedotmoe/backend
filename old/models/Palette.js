module.exports = (sequelize, DataTypes) => sequelize.define('palette', {
  user_id: DataTypes.STRING,
  palette_name: DataTypes.STRING,
  clover: DataTypes.STRING,
  member: DataTypes.STRING,
  active: DataTypes.STRING,
  regular: DataTypes.STRING,
  contributor: DataTypes.STRING,
  addicted: DataTypes.STRING,
  insomniac: DataTypes.STRING,
  nolifer: DataTypes.STRING,
  birthday: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});