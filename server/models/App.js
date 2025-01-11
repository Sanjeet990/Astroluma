'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const appsSchema = new Schema({
  appName: {
    type: String,
    required: true,
  },  
  appId: {
    type: String,
    required: true,
  },  
  version: {
    type: String,
    required: true,
  },  
  description: {
    type: String,
    required: true,
  },  
  appIcon: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const Icon = mongoose.model('App', appsSchema);

module.exports = Icon;