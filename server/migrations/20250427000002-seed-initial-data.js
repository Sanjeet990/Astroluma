'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if admin user already exists before inserting
      const existingUsers = await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE username = 'admin'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      let userId;
      
      if (existingUsers.length === 0) {
        // Create admin user
        await queryInterface.bulkInsert('Users', [{
          username: 'admin',
          password: 'e10adc3949ba59abbe56e057f20f883e', // This is the MD5 hash for '123456'
          fullName: 'Administrator',
          isSuperAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
        
        // Get the admin user's ID
        const users = await queryInterface.sequelize.query(
          `SELECT id FROM Users WHERE username = 'admin'`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        userId = users[0].id;
      } else {
        userId = existingUsers[0].id;
        console.log('Admin user already exists, skipping creation');
      }
      
      // Define the icon object used in listings
      const icon = JSON.stringify({
        iconUrl: "astroluma",
        iconUrlLight: null,
        iconProvider: 'com.astroluma.self'
      });

      // Check if listings already exist before inserting
      const existingListings = await queryInterface.sequelize.query(
        `SELECT id FROM Listings WHERE userId = ${userId} AND (listingName = 'App Cluster' OR listingName = 'Astroluma Portal' OR listingName = 'Astroluma Repo')`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (existingListings.length === 0) {
        // Seed initial listings
        await queryInterface.bulkInsert('Listings', [
          {
            listingName: 'App Cluster',
            listingIcon: icon,
            listingType: "link",
            listingUrl: 'https://appcluster.in',
            inSidebar: false,
            onFeatured: true,
            userId: userId,
            sortOrder: 9999,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            listingName: 'Astroluma Portal',
            listingIcon: icon,
            listingType: "link",
            listingUrl: 'https://getastroluma.com',
            inSidebar: false,
            onFeatured: true,
            userId: userId,
            sortOrder: 9999,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            listingName: 'Astroluma Repo',
            listingIcon: icon,
            listingType: "link",
            listingUrl: 'https://github.com/Sanjeet990/Astroluma',
            inSidebar: false,
            onFeatured: true,
            userId: userId,
            sortOrder: 9999,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      } else {
        console.log('Initial listings already exist, skipping creation');
      }

      // Check if default icon pack already exists
      const existingDefaultIconPack = await queryInterface.sequelize.query(
        `SELECT id FROM IconPacks WHERE iconProvider = 'com.astroluma.self'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (existingDefaultIconPack.length === 0) {
        // Add the default self icon pack
        await queryInterface.bulkInsert('IconPacks', [{
          iconProvider: 'com.astroluma.self',
          iconName: 'Astroluma Default',
          iconPackVersion: '1.0.0',
          jsonUrl: 'https://icons.getastroluma.com/default.json',
          packDeveloper: 'Sanjeet990',
          credit: JSON.stringify({
            name: 'Astroluma',
            url: 'https://getastroluma.com'
          }),
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      } else {
        console.log('Default icon pack already exists, skipping creation');
      }

      // Check if selfh.st icon pack already exists before inserting
      const existingSelfhstIconPack = await queryInterface.sequelize.query(
        `SELECT id FROM IconPacks WHERE iconProvider = 'com.astroluma.selfh.st'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (existingSelfhstIconPack.length === 0) {
        // Seed the selfh.st icon pack without specifying an ID (let it auto-increment)
        await queryInterface.bulkInsert('IconPacks', [{
          iconProvider: 'com.astroluma.selfh.st',
          iconName: 'Selfh.st',
          iconPackVersion: '1.0.0',
          jsonUrl: 'https://icons.getastroluma.com/selfh.st.json',
          packDeveloper: 'Sanjeet990',
          credit: JSON.stringify({
            name: 'Selfh.st',
            url: 'https://selfh.st'
          }),
          userId: null, // Default icon pack will have null in userId
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      } else {
        console.log('Selfh.st icon pack already exists, skipping creation');
      }

    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    
    // Find the admin user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE username = 'admin'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      // Delete listings associated with the admin user
      await queryInterface.bulkDelete('Listings', { userId: userId });
      
      // Delete the admin user
      await queryInterface.bulkDelete('Users', { id: userId });
    }
    
    // Delete the icon packs
    await queryInterface.bulkDelete('IconPacks', { 
      iconProvider: {
        [Sequelize.Op.in]: ['com.astroluma.selfh.st', 'com.astroluma.self']
      }
    });
  }
};