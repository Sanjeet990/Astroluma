module.exports = {
  async up(db, client) {

    const usersCollection = db.collection('users');

    const allUsers = await usersCollection.find({}).toArray();

    allUsers.forEach(async (user) => {
      if (!user.siteLogo) {
        const logo = {
          iconUrl: "astroluma",
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        };
        await usersCollection.updateOne({ _id: user._id }, { $set: { siteLogo: logo } });
      }
    });

    allUsers.forEach(async (user) => {
      if (!user.hasOwnProperty('hideBranding')) {
        await usersCollection.updateOne({ _id: user._id }, { $set: { hideBranding: false } });
      }
    });

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
