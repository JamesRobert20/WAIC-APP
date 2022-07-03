const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
class File extends Model { }

File.init({
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  text_content: {
    type: DataTypes.STRING
  },
  date_created: {
    type: DataTypes.DATEONLY
  },
  last_modified: {
    type: DataTypes.DATEONLY
  },
  num_pages: {
    type: DataTypes.INTEGER
  },
  file_author: {
    type: DataTypes.STRING
  },
  file_tags: {
   type: DataTypes.STRING 
  }
}, {
  sequelize,
  modelName: 'File'
})

module.exports = File