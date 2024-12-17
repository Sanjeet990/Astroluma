'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const appSettingsSchema = new Schema({
  settingsKey: {
    type: String,
    required: true,
    unique: true,
  },
  settingsValue: {
    type: String,
    required: true,
    unique: true,
  },
  appId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const AppSetting = mongoose.model('AppSettings', appSettingsSchema);

module.exports = AppSetting;