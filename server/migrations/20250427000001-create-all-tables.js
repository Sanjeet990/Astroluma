'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      siteName: {
        type: Sequelize.STRING,
        defaultValue: "Astroluma"
      },
      colorTheme: {
        type: Sequelize.STRING,
        defaultValue: "dark"
      },
      userAvatar: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: JSON.stringify({
          iconUrl: "defaultuser",
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        })
      },
      siteLogo: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: JSON.stringify({
          iconUrl: "astroluma",
          iconUrlLight: null,
          iconProvider: 'com.astroluma.self'
        })
      },
      isSuperAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hideBranding: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      location: {
        type: Sequelize.STRING,
        defaultValue: 'India',
        allowNull: true
      },
      unit: {
        type: Sequelize.STRING,
        defaultValue: 'metric',
        allowNull: true
      },
      longitude: {
        type: Sequelize.STRING,
        defaultValue: '77.216721',
        allowNull: true
      },
      latitude: {
        type: Sequelize.STRING,
        defaultValue: '28.644800',
        allowNull: true
      },
      camerafeed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      networkdevices: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      todolist: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      snippetmanager: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      authenticator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      linksalwaysnewtab: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      foldersalwaysnewtab: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      provider: {
        type: Sequelize.STRING,
        defaultValue: "local"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Apps table
    await queryInterface.createTable('Apps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      appName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      appId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      appIcon: {
        type: Sequelize.STRING,
        allowNull: false
      },
      npmInstalled: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      coreSettings: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      configured: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      appType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      isUpdated: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Authenticators table
    await queryInterface.createTable('Authenticators', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      serviceName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      serviceIcon: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      secretKey: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 9999
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create GlobalSettings table
    await queryInterface.createTable('GlobalSettings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      oidcConfig: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      oidcEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Icons table
    await queryInterface.createTable('Icons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      iconPath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create IconPacks table
    await queryInterface.createTable('IconPacks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      iconProvider: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      iconName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      iconPackVersion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jsonUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      packDeveloper: {
        type: Sequelize.STRING,
        allowNull: false
      },
      credit: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Listings table
    await queryInterface.createTable('Listings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      listingName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      listingIcon: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      listingType: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      listingUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      localUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      inSidebar: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      onFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      integration: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 9999
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Listings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create NetworkDevices table
    await queryInterface.createTable('NetworkDevices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      deviceMac: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      deviceName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deviceIcon: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      broadcastAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      broadcastPort: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 9
      },
      deviceIp: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      supportsWol: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      virtualDevice: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 9999
      },
      isAlive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Pages table
    await queryInterface.createTable('Pages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pageTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ""
      },
      pageContent: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Snippets table
    await queryInterface.createTable('Snippets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      snippetTitle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      snippetLanguage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Listings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      snippetItems: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '[]'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Todos table
    await queryInterface.createTable('Todos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      todoItem: {
        type: Sequelize.STRING,
        allowNull: false
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 3
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 9999
      },
      parent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'Listings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('Todos');
    await queryInterface.dropTable('Snippets');
    await queryInterface.dropTable('Pages');
    await queryInterface.dropTable('NetworkDevices');
    await queryInterface.dropTable('Listings');
    await queryInterface.dropTable('IconPacks');
    await queryInterface.dropTable('Icons');
    await queryInterface.dropTable('GlobalSettings');
    await queryInterface.dropTable('Authenticators');
    await queryInterface.dropTable('Apps');
    await queryInterface.dropTable('Users');
  }
};