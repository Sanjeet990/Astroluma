const mongoose = require('mongoose');
const { Schema } = mongoose;
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const authenticatorSchema = new Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceIcon: {
    type: Schema.Types.Mixed,
    required: false,
    default: null,
  },
  accountName: {
    type: String,
    required: true,
  },
  secretKey: {
    type: String,
    required: true,
    get: function(encryptedValue) {
      
      if (!encryptedValue) {
        return null;
      }

      try {
        // Try direct decryption
        const bytes = CryptoJS.AES.decrypt(encryptedValue, getSecretKey());
        
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
          //console.log('Decryption resulted in empty string');
          return encryptedValue; // Return original if decryption gives empty string
        }
        
        return decrypted;
      } catch (error) {
        return encryptedValue; // Return original value if decryption fails
      }
    }
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 9999,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const Authenticator = mongoose.model('Authenticator', authenticatorSchema);

module.exports = Authenticator;