'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
  listingName: {
    type: String,
    required: true,
  },
  listingIcon: {
    type: String,
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
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;