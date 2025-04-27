'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    siteName: {
      type: DataTypes.STRING,
      defaultValue: "Astroluma"
    },
    colorTheme: {
      type: DataTypes.STRING,
      defaultValue: "dark"
    },
    userAvatar: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify({
        iconUrl: "defaultuser",
        iconUrlLight: null,
        iconProvider: 'com.astroluma.self'
      }),
      get() {
        const value = this.getDataValue('userAvatar');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('userAvatar', JSON.stringify(value));
      }
    },
    siteLogo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify({
        iconUrl: "astroluma",
        iconUrlLight: null,
        iconProvider: 'com.astroluma.self'
      }),
      get() {
        const value = this.getDataValue('siteLogo');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('siteLogo', JSON.stringify(value));
      }
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hideBranding: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: 'India',
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'metric',
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING,
      defaultValue: '77.216721',
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING,
      defaultValue: '28.644800',
      allowNull: true
    },
    camerafeed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    networkdevices: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    todolist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    snippetmanager: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    authenticator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    linksalwaysnewtab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    foldersalwaysnewtab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    provider: {
      type: DataTypes.STRING,
      defaultValue: "local"
    }
  }, {
    timestamps: true
  });

  return User;
};