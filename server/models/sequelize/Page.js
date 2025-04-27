'use strict';

module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    },
    pageContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Define the association with User model
  Page.associate = function(models) {
    Page.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Page;
};