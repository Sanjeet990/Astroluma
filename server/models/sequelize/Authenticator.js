'use strict';
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../../utils/apiutils');

module.exports = (sequelize, DataTypes) => {
  const Authenticator = sequelize.define('Authenticator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serviceIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('serviceIcon');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('serviceIcon', value ? JSON.stringify(value) : null);
      }
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secretKey: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        const encryptedValue = this.getDataValue('secretKey');
        if (!encryptedValue) {
          return null;
        }
        
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedValue, getSecretKey());
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          
          if (!decrypted) {
            return encryptedValue; // Return original if decryption gives empty string
          }
          
          return decrypted;
        } catch (error) {
          return encryptedValue; // Return original value if decryption fails
        }
      }
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9999
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
  Authenticator.associate = function(models) {
    Authenticator.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Authenticator;
};