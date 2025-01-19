module.exports = {
  async up(db, client) {
    
    const usersCollection = db.collection('users');

    usersCollection.forEach(async (user) => {
      if (!user.userAvatar) {
        const avatar = {
          iconUrl: "defaultuser",
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        };
        await usersCollection.updateOne({ _id: user._id }, { $set: { userAvatar: avatar } });
      }
    });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
