'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Helper function to process listingIcon
function addListingIconItem(doc) {
  if (!doc) return;
  
  if (typeof doc.listingIcon === 'string') {
    doc.listingIconItem = {
      iconUrl: doc.listingIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  } else {
    doc.listingIconItem = doc.listingIcon;
  }
}

const listingSchema = new Schema({
  listingName: {
    type: String,
    required: true,
  },
  listingIcon: {
    type: Schema.Types.Mixed,
    required: false,
    default: null,
  },
  listingType: {
    type: String,
    required: false,
    default: null,
  },
  listingUrl: {
    type: String,
    required: false,
    default: null,
  },
  localUrl: {
    type: String,
    required: false,
    default: null,
  },
  inSidebar: {
    type: Boolean,
    default: false,
    required: true,
  },
  onFeatured: {
    type: Boolean,
    default: false,
    required: true,
  },
  integration: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: false,
  },
  sortOrder: {
    type: Number,
    default: 9999,
    required: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for listingIconItem
listingSchema.virtual('listingIconItem').get(function() {
  if (typeof this.listingIcon === 'string') {
    return {
      iconId: this.listingIcon,
      iconUrl: this.listingIcon,
      iconUrlLight: null,
      iconProvider: 'com.astroluma.self',
    };
  }
  return this.listingIcon;
});

// Post-find middleware
listingSchema.post(['find', 'findOne', 'findById'], function(docs, next) {
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

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;