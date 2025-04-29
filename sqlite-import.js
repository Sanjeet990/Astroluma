/**
 * SQLite Import Script
 * 
 * This script imports data from backup.json to SQLite database.
 * It preserves all relationships between tables while ensuring data integrity.
 */

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Path to your backup.json file
const BACKUP_FILE_PATH = path.join(__dirname, 'backup.json');

// Path to SQLite database
const SQLITE_PATH = path.join(__dirname, 'storage', 'development.sqlite');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: SQLITE_PATH,
  logging: false
});

// Define Sequelize models to match the SQLite schema
const defineModels = () => {
  // User model
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    siteName: {
      type: DataTypes.STRING,
      defaultValue: "Astroluma"
    },
    colorTheme: {
      type: DataTypes.STRING,
      defaultValue: "dark"
    },
    userAvatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    siteLogo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hideBranding: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: 'India',
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'metric',
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING,
      defaultValue: '77.216721',
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING,
      defaultValue: '28.644800',
      allowNull: true
    },
    camerafeed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    networkdevices: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    todolist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    snippetmanager: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    authenticator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    linksalwaysnewtab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    foldersalwaysnewtab: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    provider: {
      type: DataTypes.STRING,
      defaultValue: "local"
    }
  }, {
    timestamps: true
  });

  // App model
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appIcon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npmInstalled: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    coreSettings: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    configured: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  // Authenticator model
  const Authenticator = sequelize.define('Authenticator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serviceIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secretKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9999
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // GlobalSetting model
  const GlobalSetting = sequelize.define('GlobalSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    oidcConfig: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    oidcEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  // Icon model
  const Icon = sequelize.define('Icon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    iconPath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // IconPack model
  const IconPack = sequelize.define('IconPack', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    iconProvider: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    iconName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    iconPackVersion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jsonUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    packDeveloper: {
      type: DataTypes.STRING,
      allowNull: false
    },
    credit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Listing model
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    listingName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    listingIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    listingType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    listingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    localUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    inSidebar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    onFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    integration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9999
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Listings',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // NetworkDevice model
  const NetworkDevice = sequelize.define('NetworkDevice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceMac: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    deviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    broadcastAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    broadcastPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9
    },
    deviceIp: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    supportsWol: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    virtualDevice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9999
    },
    isAlive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Page model
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    },
    pageContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Snippet model
  const Snippet = sequelize.define('Snippet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    snippetTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    snippetLanguage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Listings',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    snippetItems: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]'
    }
  }, {
    timestamps: true
  });

  // Todo model
  const Todo = sequelize.define('Todo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    todoItem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9999
    },
    parent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'Listings',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Set up associations with foreignKey explicitly defined to avoid duplicate columns
  User.hasMany(Authenticator, { foreignKey: 'userId' });
  Authenticator.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Icon, { foreignKey: 'userId' });
  Icon.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(IconPack, { foreignKey: 'userId' });
  IconPack.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Listing, { foreignKey: 'userId' });
  Listing.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(NetworkDevice, { foreignKey: 'userId' });
  NetworkDevice.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Page, { foreignKey: 'userId' });
  Page.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Snippet, { foreignKey: 'userId' });
  Snippet.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Todo, { foreignKey: 'userId' });
  Todo.belongsTo(User, { foreignKey: 'userId' });

  Listing.hasMany(Listing, { foreignKey: 'parentId' });
  Listing.belongsTo(Listing, { foreignKey: 'parentId' });
  
  Listing.hasMany(Snippet, { foreignKey: 'parent' });
  Snippet.belongsTo(Listing, { foreignKey: 'parent' });
  
  Listing.hasMany(Todo, { foreignKey: 'parent' });
  Todo.belongsTo(Listing, { foreignKey: 'parent' });

  return {
    User,
    App,
    Authenticator,
    GlobalSetting,
    Icon,
    IconPack,
    Listing,
    NetworkDevice,
    Page,
    Snippet,
    Todo
  };
};

// Read backup data
const readBackupData = () => {
  try {
    const data = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading backup file:', error);
    process.exit(1);
  }
};

// Import data to SQLite
const importData = async () => {
  try {
    console.log('Connecting to SQLite database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Define models
    const models = defineModels();

    // Read backup data
    const backupData = readBackupData();
    
    // Sync models with database (this will create tables if they don't exist)
    console.log('Syncing database schema...');
    await sequelize.sync({ force: true });  // WARNING: This will drop existing tables
    
    // Import data in the order of dependencies
    console.log('Importing Users...');
    if (backupData.Users && backupData.Users.length > 0) {
      await models.User.bulkCreate(backupData.Users);
    }
    
    console.log('Importing Apps...');
    if (backupData.Apps && backupData.Apps.length > 0) {
      await models.App.bulkCreate(backupData.Apps);
    }
    
    console.log('Importing GlobalSettings...');
    if (backupData.GlobalSettings && backupData.GlobalSettings.length > 0) {
      await models.GlobalSetting.bulkCreate(backupData.GlobalSettings);
    }
    
    console.log('Importing IconPacks...');
    if (backupData.IconPacks && backupData.IconPacks.length > 0) {
      await models.IconPack.bulkCreate(backupData.IconPacks);
    }
    
    console.log('Importing Icons...');
    if (backupData.Icons && backupData.Icons.length > 0) {
      await models.Icon.bulkCreate(backupData.Icons);
    }
    
    console.log('Importing Listings...');
    if (backupData.Listings && backupData.Listings.length > 0) {
      // First import listings without parent references
      const listingsWithoutParent = backupData.Listings.filter(listing => !listing.parentId);
      await models.Listing.bulkCreate(listingsWithoutParent);
      
      // Then import listings with parent references
      const listingsWithParent = backupData.Listings.filter(listing => listing.parentId);
      await models.Listing.bulkCreate(listingsWithParent);
    }
    
    console.log('Importing NetworkDevices...');
    if (backupData.NetworkDevices && backupData.NetworkDevices.length > 0) {
      await models.NetworkDevice.bulkCreate(backupData.NetworkDevices);
    }
    
    console.log('Importing Pages...');
    if (backupData.Pages && backupData.Pages.length > 0) {
      await models.Page.bulkCreate(backupData.Pages);
    }
    
    console.log('Importing Authenticators...');
    if (backupData.Authenticators && backupData.Authenticators.length > 0) {
      await models.Authenticator.bulkCreate(backupData.Authenticators);
    }
    
    console.log('Importing Snippets...');
    if (backupData.Snippets && backupData.Snippets.length > 0) {
      await models.Snippet.bulkCreate(backupData.Snippets);
    }
    
    console.log('Importing Todos...');
    if (backupData.Todos && backupData.Todos.length > 0) {
      await models.Todo.bulkCreate(backupData.Todos);
    }
    
    console.log('Data import completed successfully!');
    
    // Verify data counts
    for (const [tableName, data] of Object.entries(backupData)) {
      if (data && data.length > 0) {
        const model = models[tableName.slice(0, -1)]; // Remove trailing 's' from table name
        const count = await model.count();
        console.log(`${tableName}: ${count} records imported (${data.length} in backup)`);
        
        // Log warning if counts don't match
        if (count !== data.length) {
          console.warn(`Warning: Count mismatch for ${tableName}. Expected ${data.length}, got ${count}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the import function
importData();