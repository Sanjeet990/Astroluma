'use strict';
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../../utils/apiutils');

const SECRET_KEY = getSecretKey();

module.exports = (sequelize, DataTypes) => {
  const GlobalSetting = sequelize.define('GlobalSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    oidcConfig: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('oidcConfig');
        if (!value) return null;
        
        const parsedValue = JSON.parse(value);
        
        // Handle clientSecret decryption
        if (parsedValue.clientSecret) {
          try {
            const bytes = CryptoJS.AES.decrypt(parsedValue.clientSecret, SECRET_KEY);
            const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
            parsedValue.clientSecret = JSON.parse(decryptedValue);
          } catch (error) {
            console.error('Error decrypting config:', error);
            parsedValue.clientSecret = null;
          }
        }
        
        return parsedValue;
      },
      set(value) {
        if (!value) {
          this.setDataValue('oidcConfig', null);
          return;
        }
        
        // Clone to avoid modifying the original object
        const configToSave = JSON.parse(JSON.stringify(value));
        
        // Encrypt clientSecret if present
        if (configToSave.clientSecret !== null && configToSave.clientSecret !== undefined) {
          configToSave.clientSecret = CryptoJS.AES.encrypt(
            JSON.stringify(configToSave.clientSecret),
            SECRET_KEY
          ).toString();
        }
        
        this.setDataValue('oidcConfig', JSON.stringify(configToSave));
      }
    },
    oidcEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  return GlobalSetting;
};