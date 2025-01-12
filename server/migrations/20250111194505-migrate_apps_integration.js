const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const SECRET_KEY = getSecretKey();

const doDecrypt = (v) => {
  if (v === null) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(v, SECRET_KEY);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue.replaceAll("\"", "");
  } catch (error) {
    console.error('Error decrypting config:', error);
    return null;
  }
}

module.exports = {
  async up(db, client) {

    const listingsCollection = db.collection('listings');
    const integrationCollection = db.collection('integrations');

    //Migrate integration
    const allListings = await listingsCollection.find({ "listingType": "link" }).toArray();

    console.log("Migrating integration for listings", allListings.length);

    // Use for...of instead of forEach for async/await
    for (const listing of allListings) {
      // if listing has integration
      if (listing.integration) {
        // fetch the integration
        const integration = await integrationCollection.findOne({ _id: listing.integration });
        if (integration) {
          const singleDecryptedConfig = doDecrypt(integration.config);

          const integrationObj = {
            appId: integration.appId,
            alwaysShowDetailedView: integration.alwaysShowDetailedView,
            autoRefreshAfter: integration.autoRefreshAfter,
            config: singleDecryptedConfig,
          };

          console.log("Integration found for listing", listing.listingName, listing._id, integrationObj);

          // update the listing with the integration
          try {
            const result = await listingsCollection.updateOne(
              { _id: listing._id },
              { $set: { integration: integrationObj } }
            );
            if (result.modifiedCount === 0) {
              console.log("No record updated for listing", listing.listingName);
            }
          } catch (ex) {
            console.log("Error updating listing", ex);
          }
        } else {
          console.log("Integration not found for listing", listing.listingName);
        }
      } else {
        console.log("No integration found for listing", listing.listingName);
      }
    }

    // Remove the integration collection
    await integrationCollection.drop();
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
