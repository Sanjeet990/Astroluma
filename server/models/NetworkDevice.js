const mongoose = require('mongoose');
const { Schema } = mongoose;


// Helper function to process listingIcon
function addListingIconItem(doc) {
  if (!doc) return;
  
  if (typeof doc.deviceIcon === 'string') {
    doc.listingIconItem = {
      iconUrl: doc.deviceIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  } else {
    doc.listingIconItem = doc.deviceIcon;
  }
}

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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for listingIconItem
networkSchema.virtual('listingIconItem').get(function() {
  if (typeof this.deviceIcon === 'string') {
    return {
      iconId: this.deviceIcon,
      iconUrl: this.deviceIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  }
  return this.deviceIcon;
});

// Post-find middleware
networkSchema.post(['find', 'findOne', 'findById'], function(docs, next) {
  // Handle single document
  if (!Array.isArray(docs)) {
    addListingIconItem(docs);
    return next();
  }
  
  // Handle array of documents
  docs.forEach(doc => {
    addListingIconItem(doc);
  });
  
  next();
});

const NetworkDevice = mongoose.model('NetworkDevice', networkSchema);

module.exports = NetworkDevice;