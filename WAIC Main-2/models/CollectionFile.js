const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
class CollectionFile extends Model { }

CollectionFile.init({
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  original_file: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pages_from_original: {
    type: DataTypes.STRING
  },
}, {
  sequelize,
  modelName: 'CollectionFile'
})

module.exports = CollectionFile