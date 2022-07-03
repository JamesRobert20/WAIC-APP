const pptRouter = require('express').Router()
const handle_files = require('../utils/handle_files')

pptRouter.post('/', async (req, res) => {
  try {
    const { file_name, collection_name } = req.body
    await handle_files.exportPowerpoint(file_name, collection_name)
    return res.status(200).json({ success: "powerpoint created" })
  } catch (e) {
    res.status(400).json({ error: "couldn't create powerpoint", message: e.message })
  }
})


module.exports = pptRouter
