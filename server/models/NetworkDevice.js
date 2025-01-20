const mongoose = require('mongoose');
const { Schema } = mongoose;

const networkSchema = new mongoose.Schema({
  deviceMac: {
    type: String,
    required: false,
    default: null
  },
  deviceName: {
    type: String,
    required: true,
  },
  deviceIcon: {
    type: Schema.Types.Mixed,
    required: false,
    default: null,
  },
  broadcastAddress: {
    type: String,
    required: false,
    default: null
  },
  broadcastPort: {
    type: Number,
    required: false,
    default: 9
  },
  deviceIp : {
    type: String,
    required: false,
    default: null
  },
  supportsWol : {
    type: Boolean,
    default: false
  },
  virtualDevice : {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    required: false,
    default: 9999
  },
  isAlive: {
    type: Boolean,
    required: false,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const NetworkDevice = mongoose.model('NetworkDevice', networkSchema);

module.exports = NetworkDevice;