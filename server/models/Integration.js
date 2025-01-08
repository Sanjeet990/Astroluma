const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const SECRET_KEY = getSecretKey();

const integrationSchema = new mongoose.Schema({
  integrationName: {
    type: String,
    required: true,
  },
  appId: {
    type: String,
    required: true,
  },
  appIcon: {
    type: String,
    required: false,
    default: ''
  },
  alwaysShowDetailedView: {
    type: Boolean,
    required: false,
    default: false
  },
  autoRefreshAfter: {
    type: Number,
    required: false,
    default: 0
  },
  config: {
    type: String,
    required: false,
    default: null,
    set: v => CryptoJS.AES.encrypt(JSON.stringify(v), SECRET_KEY).toString(),
    get: v => {
      const bytes = CryptoJS.AES.decrypt(v, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  }
}, {
  timestamps: true,
});

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;