const User = require('./models/User');
const Listing = require('./models/Listing');

const seedUserData = async () => {
    // Check if there are any users in the collection
    const usersExist = await User.countDocuments();

    if (usersExist > 0) {
        console.log('Data already exists, skipping seeding process.');
        return;
    }

    // If no data exists, proceed with seeding
    console.log('No existing data found, proceeding with seeding.');

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