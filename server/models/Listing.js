'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const SECRET_KEY = getSecretKey();

const integrationSchema = new Schema({
  appId: {
    type: String,
    required: true,
  },
  alwaysShowDetailedView: {
    type: Boolean,
    required: false,
    default: false
  },
  autoRefreshAfter: {
    type: Number,
    required: false,
    default: 0
  },
  config: {
    type: String,
    required: false,
    default: null,
    set: function(v) {
      if (v === null) return null;
      return CryptoJS.AES.encrypt(JSON.stringify(v), SECRET_KEY).toString();
    },
    get: function(v) {
      if (v === null) return null;
      try {
        const bytes = CryptoJS.AES.decrypt(v, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch (error) {
        console.error('Error decrypting config:', error);
        return "pull";
      }
    }
  },
});

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
    type: integrationSchema,
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
  toJSON: { getters: true },
  toObject: { getters: true }
});

/**
 * Recursively deletes all children of a given listing
 * @param {ObjectId} parentId - The ID of the parent listing
 */
async function deleteChildren(parentId) {
  const children = await Listing.find({ parentId });
  
  for (const child of children) {
    await deleteChildren(child._id);
  }
  
  if (children.length > 0) {
    await Listing.deleteMany({ parentId });
  }
}

// Add the static method to your schema
listingSchema.statics.deleteWithChildren = async function(listingId) {
  const listing = await this.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  await deleteChildren(listingId);
  await listing.deleteOne();
};


const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;