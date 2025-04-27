'use strict';

module.exports = (sequelize, DataTypes) => {
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
      allowNull: true,
      get() {
        const value = this.getDataValue('credit');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('credit', value ? JSON.stringify(value) : null);
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
    timestamps: true,
    tableName: 'IconPacks'
  });

  // Define the association with User model
  IconPack.associate = function(models) {
    IconPack.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return IconPack;
};