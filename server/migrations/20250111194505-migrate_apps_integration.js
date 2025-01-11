module.exports = {
  async up(db, client) {
    
    const listingsCollection = db.collection('listings');
    const integrationCollection = db.collection('integrations');

    
    //Migrate integration
    const allListings = await listingsCollection.find({}).toArray();

    allListings.forEach(async (listing) => {
      //if listing has integration
      if (listing.integration) {
        //fetch the integration
        const integration = await integrationCollection.findOne({ _id: listing.integration });
        if (integration) {
          const integrationObj = {
            appId: integration.appId,
            alwaysShowDetailedView: integration.alwaysShowDetailedView,
            autoRefreshAfter: integration.autoRefreshAfter,
            config: integration.config,
          };
          //update the listing with the integration
          await listingsCollection.updateOne({ _id: listing._id }, { $set: { integration: integrationObj } });
        }

      }

    });

    //Remove the integration collection
    await integrationCollection.drop();

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
