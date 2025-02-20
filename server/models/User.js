'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  siteName: {
    type: String,
    default: "Astroluma",
  },
  colorTheme: {
    type: String,
    default: "dark",
  },
  userAvatar: {
    type: Object,
    required: false,
    default: {
      iconUrl: "defaultuser",
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self'
    },
  },
  siteLogo: {
    type: Object,
    required: false,
    default: {
      iconUrl: "astroluma",
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self'
    },
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  hideBranding: {
    type: Boolean,
    default: false,
    required: false,
  },
  location: {
    type: String,
    default: 'India',
    required: false,
  },
  unit: {
    type: String,
    default: 'metric',
    required: false,
  },
  longitude: {
    type: String,
    default: '77.216721',
    required: false,
  },
  latitude: {
    type: String,
    default: '28.644800',
    required: false,
  },
  camerafeed: {
    type: Boolean,
    default: false,
  },
  networkdevices: {
    type: Boolean,
    default: false,
  },
  todolist: {
    type: Boolean,
    default: false,
  },
  snippetmanager: {
    type: Boolean,
    default: false,
  },
  authenticator: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;