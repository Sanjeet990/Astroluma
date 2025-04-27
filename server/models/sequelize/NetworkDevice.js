'use strict';

module.exports = (sequelize, DataTypes) => {
  const NetworkDevice = sequelize.define('NetworkDevice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceMac: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    deviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('deviceIcon');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('deviceIcon', value ? JSON.stringify(value) : null);
      }
    },
    broadcastAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    broadcastPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9
    },
    deviceIp: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    supportsWol: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    virtualDevice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9999
    },
    isAlive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
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
  NetworkDevice.associate = function(models) {
    NetworkDevice.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return NetworkDevice;
};