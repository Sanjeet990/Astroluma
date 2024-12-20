const User = require('./models/User');
const Listing = require('./models/Listing');
const IconPack = require('./models/IconPack');

const seedUserData = async () => {
    // Check if there are any users in the collection
    const usersExist = await User.countDocuments();

    if (usersExist > 0) {
        console.log('User already present in DB. Skipping user seed');
    } else {

        // If no data exists, proceed with seeding
        console.log('No existing data found, proceeding with user seeding.');

        // Clear the User collection
        await User.deleteMany({});
        console.log('User collection cleared.');

        // Seed data
        const seedUser = new User({
            username: 'admin',
            password: 'e10adc3949ba59abbe56e057f20f883e', // 123456, Please hash passwords securely in production
            fullName: 'Administrator',
            isSuperAdmin: true
        });

        // Insert seed data
        await seedUser.save();
        console.log('User data seeded successfully.');

        const linksArray = [
            {
                listingName: 'App Cluster',
                listingIcon: 'astroluma',
                listingType: "link",
                listingUrl: 'https://appcluster.in',
                inSidebar: false,
                onFeatured: true,
                userId: seedUser._id
            },
            {
                listingName: 'Astroluma Portal',
                listingIcon: 'astroluma',
                listingType: "link",
                listingUrl: 'https://getastroluma.com',
                inSidebar: false,
                onFeatured: true,
                userId: seedUser._id
            },
            {
                listingName: 'Astroluma Repo',
                listingIcon: 'astroluma',
                listingType: "link",
                listingUrl: 'https://github.com/Sanjeet990/Astroluma',
                inSidebar: false,
                onFeatured: true,
                userId: seedUser._id
            }
        ]

        await Listing.insertMany(linksArray);

        console.log('Initial links seeded successfully.');

    }

    // Check if selfh.st icon pack is already installed
    const selfhostIconPack = await IconPack.findOne({ iconProvider: 'com.astroluma.selfh.st' });

    if(!selfhostIconPack){
        console.log('Selfh.st icon pack not found. Seeding selfh.st icon pack.');

        const selfhstIconPack = new IconPack({
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
        });

        await selfhstIconPack.save();
        console.log('Selfh.st icon pack seeded successfully.');
    }

    console.log('Data seeded successfully.');
}

const checkAndSeedData = async () => {
    try {
        await seedUserData();
        //await clearAllImages();
    } catch (error) {
        console.error('Error during seeding process:', error);
    }
}

module.exports = { checkAndSeedData };