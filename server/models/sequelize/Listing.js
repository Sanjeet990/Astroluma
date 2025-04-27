'use strict';
const CryptoJS = require('crypto-js');
const { getSecretKey } = require('../../utils/apiutils');

const SECRET_KEY = getSecretKey();

module.exports = (sequelize, DataTypes) => {
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
      defaultValue: null,
      get() {
        const value = this.getDataValue('listingIcon');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('listingIcon', value ? JSON.stringify(value) : null);
      }
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
      allowNull: true,
      get() {
        const value = this.getDataValue('integration');
        if (!value) return null;
        
        const parsedValue = JSON.parse(value);
        
        // Handle config decryption
        if (parsedValue.config) {
          try {
            const bytes = CryptoJS.AES.decrypt(parsedValue.config, SECRET_KEY);
            const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
            parsedValue.config = JSON.parse(decryptedValue);
          } catch (error) {
            console.error('Error decrypting config:', error);
            parsedValue.config = null;
          }
        }
        
        return parsedValue;
      },
      set(value) {
        if (!value) {
          this.setDataValue('integration', null);
          return;
        }
        
        // Clone to avoid modifying the original object
        const integrationToSave = JSON.parse(JSON.stringify(value));
        
        // Encrypt config if present
        if (integrationToSave.config !== null && integrationToSave.config !== undefined) {
          integrationToSave.config = CryptoJS.AES.encrypt(
            JSON.stringify(integrationToSave.config),
            SECRET_KEY
          ).toString();
        }
        
        this.setDataValue('integration', JSON.stringify(integrationToSave));
      }
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

  // Define associations
  Listing.associate = function(models) {
    Listing.belongsTo(models.User, { foreignKey: 'userId' });
    Listing.belongsTo(Listing, { as: 'parent', foreignKey: 'parentId' });
    Listing.hasMany(Listing, { as: 'children', foreignKey: 'parentId' });
  };

  // Add method to delete a listing and all its children
  Listing.deleteWithChildren = async function(listingId) {
    const transaction = await sequelize.transaction();
    
    try {
      const listing = await this.findByPk(listingId, { transaction });
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Recursive function to delete children
      const deleteChildren = async (parentId) => {
        const children = await this.findAll({ 
          where: { parentId },
          transaction
        });
        
        for (const child of children) {
          await deleteChildren(child.id);
        }
        
        if (children.length > 0) {
          await this.destroy({ 
            where: { parentId },
            transaction
          });
        }
      };
      
      await deleteChildren(listingId);
      await listing.destroy({ transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  
  return Listing;
};