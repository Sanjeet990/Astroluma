'use strict';

module.exports = (sequelize, DataTypes) => {
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
      defaultValue: 3,
      validate: {
        isIn: [[1, 2, 3]]
      }
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

  // Define associations
  Todo.associate = function(models) {
    Todo.belongsTo(models.User, { foreignKey: 'userId' });
    Todo.belongsTo(models.Listing, { foreignKey: 'parent', as: 'parentListing' });
  };

  return Todo;
};