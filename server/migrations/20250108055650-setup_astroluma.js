module.exports = {
    async up(db, client) {
        const usersCollection = db.collection('users');
        const listingsCollection = db.collection('listings');
        const iconPacksCollection = db.collection('iconpacks');

        // Check if there are any users
        const usersCount = await usersCollection.countDocuments();

        if (usersCount === 0) {
            // Create admin user
            const seedUser = {
                username: 'admin',
                password: 'e10adc3949ba59abbe56e057f20f883e',
                fullName: 'Administrator',
                isSuperAdmin: true
            };

            const result = await usersCollection.insertOne(seedUser);
            const userId = result.insertedId;
            const icon = {
                iconUrl: "astroluma",
                iconUrlLight: null,
                iconProvider: 'com.astroluma.self'
            }

            // Seed initial listings
            const linksArray = [
                {
                    listingName: 'App Cluster',
                    listingIcon: icon,
                    listingType: "link",
                    listingUrl: 'https://appcluster.in',
                    inSidebar: false,
                    onFeatured: true,
                    userId: userId
                },
                {
                    listingName: 'Astroluma Portal',
                    listingIcon: icon,
                    listingType: "link",
                    listingUrl: 'https://getastroluma.com',
                    inSidebar: false,
                    onFeatured: true,
                    userId: userId
                },
                {
                    listingName: 'Astroluma Repo',
                    listingIcon: 'astroluma',
                    listingType: icon,
                    listingUrl: 'https://github.com/Sanjeet990/Astroluma',
                    inSidebar: false,
                    onFeatured: true,
                    userId: userId
                }
            ];

            await listingsCollection.insertMany(linksArray);
        }

        // Check and seed selfh.st icon pack
        const selfhostIconPack = await iconPacksCollection.findOne({
            iconProvider: 'com.astroluma.selfh.st'
        });

        if (!selfhostIconPack) {
            const selfhstIconPack = {
                iconProvider: 'com.astroluma.selfh.st',
                iconName: 'Selfh.st',
                iconPackVersion: '1.0.0',
                jsonUrl: 'https://icons.getastroluma.com/selfh.st.json',
                packDeveloper: 'Sanjeet990',
                credit: {
                    name: 'Selfh.st',
                    url: 'https://selfh.st'
                },
                userId: null //Default icon pack will have null in userid
            };

            await iconPacksCollection.insertOne(selfhstIconPack);
        }

    },

    async down(db, client) {
        // Revert the changes
        const usersCollection = db.collection('users');
        const listingsCollection = db.collection('listings');
        const iconPacksCollection = db.collection('iconpacks');

        // Remove the admin user and associated listings
        const adminUser = await usersCollection.findOne({ username: 'admin' });
        if (adminUser) {
            await listingsCollection.deleteMany({ userId: adminUser._id });
            await usersCollection.deleteOne({ _id: adminUser._id });
        }

        // Remove the selfh.st icon pack
        await iconPacksCollection.deleteOne({
            iconProvider: 'com.astroluma.selfh.st'
        });
    }
};