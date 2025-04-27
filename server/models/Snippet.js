'use strict';

module.exports = (sequelize, DataTypes) => {
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
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('snippetItems');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('snippetItems', JSON.stringify(value || []));
      }
    }
  }, {
    timestamps: true
  });

  // Define associations
  Snippet.associate = function(models) {
    Snippet.belongsTo(models.User, { foreignKey: 'userId' });
    Snippet.belongsTo(models.Listing, { foreignKey: 'parent', as: 'parentListing' });
  };

  return Snippet;
};