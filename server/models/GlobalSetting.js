'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const SECRET_KEY = getSecretKey();

const oidcSchema = new Schema({
  issuerUrl: {
    type: String,
    required: true,
    default: "",
  },
  clientId: {
    type: String,
    required: true,
    default: "",
  },
  clientSecret: {
    type: String,
    required: true,
    default: "",
    set: function (v) {
          if (v === null) return null;
          return CryptoJS.AES.encrypt(JSON.stringify(v), SECRET_KEY).toString();
        },
        get: function (v) {
          if (v === null) return null;
          try {
              const bytes = CryptoJS.AES.decrypt(v, SECRET_KEY);
              const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
              //console.log('Decrypted value:', decryptedValue); // Add this line for debugging
              return JSON.parse(decryptedValue);
          } catch (error) {
              console.error('Error decrypting config:', error);
              return null;
          }
      },
  },
  redirectUri: {
    type: String,
    required: true,
    default: "",
  },
  logoutUri: {
    type: String,
    required: true,
    default: "",
  },
  scope: {
    type: String,
    required: true,
    default: "",
  },
  authorizationEndpoint: {
    type: String,
    required: true,
    default: "",
  },
  tokenEndpoint: {
    type: String,
    required: true,
    default: "",
  },
  userinfoEndpoint: {
    type: String,
    required: true,
    default: "",
  },
  userIdentifier: {
    type: String,
    required: true,
    default: "",
  },
  jwksUri: {
    type: String,
    required: true,
    default: "",
  },
  autoProvisioning: {
    type: Boolean,
    required: true,
    default: false,
  }
});

const globalsettingSchema = new Schema({
  oidcConfig:{
    type: oidcSchema,
    required: false,
    default: null,
  },
  oidcEnabled: {
    type: Boolean,
    required: true,
    default: false,
  }
}, {
  timestamps: true,
  toJSON: { getters: true},
  toObject: { getters: true},
});

const GlobalSetting = mongoose.model('GlobalSetting', globalsettingSchema);

module.exports = GlobalSetting;