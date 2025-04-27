const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../utils/apiutils');

const SECRET_KEY = getSecretKey();

const recursiveDecrypt = (encryptedText, secretKey, maxDepth = 4, currentDepth = 0) => {
  if (currentDepth >= maxDepth) {
    return null;
  }

  if (!encryptedText) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    let decryptedValue = bytes.toString(CryptoJS.enc.Utf8);


    // If the decrypted value is a quoted string, unquote it
    if (decryptedValue.startsWith('"') && decryptedValue.endsWith('"')) {
      decryptedValue = decryptedValue.slice(1, -1);
    }

    try {
      const parsedJson = JSON.parse(decryptedValue);
      // Only consider it valid JSON if it's an object or array
      if (typeof parsedJson === 'object' && parsedJson !== null) {
        console.log(`Valid JSON found at level ${currentDepth + 1}`);
        return parsedJson;
      }
    } catch (jsonError) {
      console.log(`Not valid JSON at level ${currentDepth + 1}, continuing decryption...`);
      //console.log(decryptedValue, jsonError);
    }

    // Continue decryption with the unquoted value
    return recursiveDecrypt(decryptedValue, secretKey, maxDepth, currentDepth + 1);

  } catch (decryptError) {
    return null;
  }
};

module.exports = {
  async up(db, client) {

    const listingsCollection = db.collection('listings');
    const integrationCollection = db.collection('integrations');

    //Migrate integration
    const allListings = await listingsCollection.find({ "listingType": "link", "integration": { $ne: null } }).toArray();

    console.log(`Found ${allListings.length} listings with integrations`);

    let processed = 0;

    // Use for...of instead of forEach for async/await
    for (const listing of allListings) {
      // if listing has integration
      if (listing.integration) {
        // fetch the integration
        const integration = await integrationCollection.findOne({ _id: listing.integration });
        if (integration) {
          //Decrypt recursively to fix multi level encryption to some user
          const decryptedConfig = recursiveDecrypt(integration?.config, SECRET_KEY);

          const encryptedConfig = CryptoJS.AES.encrypt(JSON.stringify(decryptedConfig), SECRET_KEY).toString();

          console.log('Decrypted config:', decryptedConfig);

          // update the listing with the integration

          const integrationObj = {
            appId: integration.appId,
            alwaysShowDetailedView: integration.alwaysShowDetailedView,
            autoRefreshAfter: integration.autoRefreshAfter,
            config: encryptedConfig,
          };

          try {
            const result = await listingsCollection.updateOne(
              { _id: listing._id },
              { $set: { integration: integrationObj } }
            );

            processed++;
          } catch (ex) {
            console.log("Error updating listing", ex);
          }

        }
      }
    }

    console.log(`Processed ${processed} listings`);

    // Only drop collections if they exist
    const existingIntegrationCollection = await db.listCollections({ name: 'integrations' }).hasNext();
    const existingAppsettingsCollection = await db.listCollections({ name: 'appsettings' }).hasNext();

    if (existingIntegrationCollection) {
      //await integrationCollection.drop();
    }
    
    if (existingAppsettingsCollection) {
      //await appsettingsCollection.drop();
    }

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
