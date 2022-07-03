const collectionsRouter = require('express').Router()
const Collection = require('../models/Collection')
const CollectionFile = require('../models/CollectionFile')
const handle_files = require('../utils/handle_files')

collectionsRouter.post('/', async (req, res) => {
  try {
    const { name, files } = req.body
    await handle_files.createCollection(name,files)
    return res.status(200).json({ success: "collection created" })
  } catch (e) {
    res.status(400).json({ error: "couldn't create collection", message: e.message })
  }
})


module.exports = collectionsRouter
