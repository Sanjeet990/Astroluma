'use strict';

module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appIcon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npmInstalled: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    coreSettings: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    configured: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    appType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    isUpdated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  return App;
};