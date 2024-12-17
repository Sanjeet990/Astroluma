'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const iconpackSchema = new Schema({
  iconProvider: {
    type: String,
    required: true,
    unique: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  iconPackVersion: {
    type: String,
    required: true,
  },
  jsonUrl: {
    type: String,
    required: true,
  },
  packDeveloper: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  }
}, {
  timestamps: true,
});

const IconPack = mongoose.model('IconPacks', iconpackSchema);

module.exports = IconPack;