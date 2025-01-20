module.exports = {
  async up(db, client) {
    
    const listingsCollection = db.collection('listings');
    const authenticatorsCollection = db.collection('authenticators');
    const networkdevicesCollection = db.collection('networkdevices');

    //Migrate Listing Icons
    const allListings = await listingsCollection.find({}).toArray();

    allListings.forEach(async (listing) => {
      //if listing.listingIcon is a String, make it an object in format {iconUrl: listing.listingIcons, iconUrlLight: null, iconProvider: 'com.astroluma.self'}
      if (typeof listing.listingIcon === 'string') {
        const icon = {
          iconUrl: listing.listingIcon,
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        };
        await listingsCollection.updateOne({ _id: listing._id }, { $set: { listingIcon: icon } });
      }
    });

    //Migrate Authenticator Icons
    const allAuths = await authenticatorsCollection.find({}).toArray();

    allAuths.forEach(async (singleAuth) => {
      if (typeof singleAuth.serviceIcon === 'string') {
        const icon = {
          iconUrl: singleAuth.serviceIcon,
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        };
        await authenticatorsCollection.updateOne({ _id: singleAuth._id }, { $set: { serviceIcon: icon } });
      }
    });

    //Migrate Network Devices Icons
    const allDevices = await networkdevicesCollection.find({}).toArray();

    allDevices.forEach(async (singleDevice) => {
      if (typeof singleDevice.deviceIcon === 'string') {
        const icon = {
          iconUrl: singleDevice.deviceIcon,
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        };
        await networkdevicesCollection.updateOne({ _id: singleDevice._id }, { $set: { deviceIcon: icon } });
      }
    });

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
