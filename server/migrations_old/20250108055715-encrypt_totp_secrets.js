const { getSecretKey } = require("../utils/apiutils");
const CryptoJS = require('crypto-js');


module.exports = {
  async up(db, client) {
    
    const secret = getSecretKey();

    const authenticatorCollection = db.collection('authenticators');

    const allAuthenticators = await authenticatorCollection.find({});

    allAuthenticators.forEach(async (singleAuth) => {
      //ENcrypt the TOTP secrets
      const secretKey = singleAuth.secretKey;
      const encryptedSecret = CryptoJS.AES.encrypt(secretKey, secret).toString();

      //Update the listing
      await authenticatorCollection.updateOne({ _id: singleAuth._id }, { $set: { secretKey: encryptedSecret } });
    });

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
