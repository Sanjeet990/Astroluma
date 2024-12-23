'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Helper function to process listingIcon
function addListingIconItem(doc) {
  if (!doc) return;

  if (typeof doc.serviceIcon === 'string') {
    doc.listingIconItem = {
      iconUrl: doc.deviceIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  } else {
    doc.listingIconItem = doc.serviceIcon;
  }
}

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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Virtual for listingIconItem
authenticatorSchema.virtual('listingIconItem').get(function () {
  if (typeof this.serviceIcon === 'string') {
    return {
      iconId: this.serviceIcon,
      iconUrl: this.serviceIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  }
  return this.serviceIcon;
});

// Post-find middleware
authenticatorSchema.post(['find', 'findOne', 'findById'], function (docs, next) {
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

const Authenticator = mongoose.model('Authenticator', authenticatorSchema);

module.exports = Authenticator;