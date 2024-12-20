'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const authenticatorSchema = new Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceIcon: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  secretKey: {
    type: String,
    required: true,
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
});

const Authenticator = mongoose.model('Authenticator', authenticatorSchema);

module.exports = Authenticator;