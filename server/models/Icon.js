'use strict';

module.exports = (sequelize, DataTypes) => {
  const Icon = sequelize.define('Icon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    iconPath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Define the association with User model
  Icon.associate = function(models) {
    Icon.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Icon;
};