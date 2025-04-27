const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Snippet = sequelize.define('Snippet', {
    snippetName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    snippetCode: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    snippetLanguage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    snippetDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
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

  Snippet.associate = (models) => {
    Snippet.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Snippet;
};
