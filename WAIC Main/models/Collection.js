const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')

class Collection extends Model { }

Collection.init({
  collection_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  collection_tags: {
    type: DataTypes.STRING
  },
}, {
  sequelize,
  modelName: 'Collection'
})

module.exports = Collection