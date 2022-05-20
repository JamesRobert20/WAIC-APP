const filesRouter = require('express').Router()
const File = require('../models/File')
const database_helper = require('../utils/database_helper')

filesRouter.get('/', async (req, res) => {
  const files = await File.findAll({ attributes: { exclude: ['text_content','createdAt','updatedAt']} });
  return res.json({ files: files })
})

filesRouter.post('/search', async (req, res) => {
  const { file_name, content, dateCreatedBefore, dateCreatedAfter, author, lastModBefore, lastModAfter, numPagesMin, numPagesMax } = req.body
  return res.json({results: await database_helper.searchFiles(file_name, content, dateCreatedBefore, dateCreatedAfter, author, lastModBefore, lastModAfter, numPagesMin, numPagesMax)})
})

// Route to add one or more tags to a file.
filesRouter.post('/:filename', async (req, res) => {

  const { filename } = req.params 
  const { tag } = req.body

  const file = await File.findOne({
    where: {
      file_name: filename
    }
  })

  if (!file) {
    return res.status(400).json({ error: `file with filename ${filename} doesn't exist`})
  }
  if (file.file_tags == null) {
    file.file_tags = ""
  }
  file.file_tags += (tag + ",")
  await file.save()
  return res.status(200).json({ success: "tag successfully added to file"})

})

module.exports = filesRouter
