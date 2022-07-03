const decksRouter = require('express').Router()
const handle_files = require('../utils/handle_files')

decksRouter.post("/", async (req, res) => {
  const { deckName, deckPages } = req.body
  try {
    await handle_files.createPDF(deckPages,deckName)
  } catch(e) {
    return res.status(400).json({ error: "bad request..." })
  }
  return res.status(200).json({ success: "deck has been created successfully"})
})


module.exports = decksRouter