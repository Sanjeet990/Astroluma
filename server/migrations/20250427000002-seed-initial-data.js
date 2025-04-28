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

      // Check if icon packs already exist before inserting
      const existingSelfhstIconPack = await queryInterface.sequelize.query(
        `SELECT id FROM IconPacks WHERE iconProvider = 'com.astroluma.selfh.st'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (existingSelfhstIconPack.length === 0) {
        // Seed the selfh.st icon pack
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
      
      // Check if app integrations already exist
      const existingApps = await queryInterface.sequelize.query(
        `SELECT id FROM Apps WHERE appId IN ('com.github', 'com.heimdall', 'com.html', 'com.portainer', 'com.proxmox', 'com.proxyman', 'com.truenas.scale', 'com.youtube')`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (existingApps.length === 0) {
        // Seed app integrations
        await queryInterface.bulkInsert('Apps', [
          {
            appName: 'Github',
            appId: 'com.github',
            version: '1.0.0',
            description: 'Monitor your Github account statistics and display key details on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/github.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'Heimdall',
            appId: 'com.heimdall',
            version: '1.0.0',
            description: 'Display Heimdall dashboard statistics and key insights directly on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/heimdall.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'HTML Code',
            appId: 'com.html',
            version: '1.0.0',
            description: 'Use HTML code to customize and display static content on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/chromium.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'Portainer',
            appId: 'com.portainer',
            version: '1.0.0',
            description: 'Show statistics from your Portainer dashboard directly on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/portainer.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'Proxmox',
            appId: 'com.proxmox',
            version: '1.0.0',
            description: 'Display Proxmox server statistics and basic metrics on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/proxmox.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'NGINX Proxy Manager',
            appId: 'com.proxyman',
            version: '1.0.0',
            description: 'Monitor basic statistics from your NGINX Proxy Manager and display them on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/nginx-proxy-manager.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'TrueNAS',
            appId: 'com.truenas.scale',
            version: '1.0.0',
            description: 'Show statistics and key metrics from your TrueNAS server on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/truenas-scale.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            appName: 'YouTube Legacy',
            appId: 'com.youtube',
            version: '1.0.0',
            description: 'Display YouTube statistics, including view counts and thumbnails, on the link tile.',
            appIcon: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/youtube.svg',
            npmInstalled: 1,
            coreSettings: false,
            configured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      } else {
        console.log('App integrations already exist, skipping creation');
      }

    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Delete the app integrations
    await queryInterface.bulkDelete('Apps', {
      appId: {
        [Sequelize.Op.in]: [
          'com.github', 'com.heimdall', 'com.html', 'com.portainer',
          'com.proxmox', 'com.proxyman', 'com.truenas.scale', 'com.youtube'
        ]
      }
    });
    
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