const collectionsRouter = require('express').Router()
const File = require('../models/File')
const Collection = require('../models/Collection')
const { v4: uuidv4 } = require('uuid')
const database_helper = require('../utils/database_helper')
const CollectionFile = require('../models/CollectionFile')
const handle_files = require('../utils/handle_files')

collectionsRouter.get('/', async (req,res) => {
  const collections = await Collection.findAll({ attributes: { exclude: ['createdAt','updatedAt']}, include: CollectionFile })
  return res.json({ collections: collections})
})

collectionsRouter.post('/', async (req, res) => {
  try {

    const { collectionFiles, collectionName} = req.body
    const newCol = await Collection.create({ collection_name: collectionName })
    // console.log('collection files array: ' + typeof collectionFiles)
    // for each file sent

    for (let file of collectionFiles) {
      // get file name (string) and pages to get from file (array of nums, each num = 1 page (zero indexed))
      const { fileName, pages } = file
      // create new collectionFile
      const newName = uuidv4()
      await handle_files.createCollectionFile(fileName, pages, newName)
      // create string representing which pages of original file are in this collection file
      var arr = pages.join(",")

      // create and insert the new CollectionFile into the database
      const colFile = await CollectionFile.create({ file_name: newName, original_file : fileName, pages_from_original : arr })
      await newCol.addCollectionFile(colFile)
    }
    return res.json({ bruh: "lol"})
  } catch(e) {
      return res.status(400).json({ error: e.message })
  }
})
module.exports = collectionsRouter
