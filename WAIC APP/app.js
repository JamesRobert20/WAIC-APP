const express = require('express')
const app = express()
const filesRouter = require('./controllers/filesRouter')
const collectionsRouter = require('./controllers/collectionsRouter')
const decksRouter = require('./controllers/decksRouter')
const pptRouter = require('./controllers/pptRouter')

const handle_files = require('./utils/handle_files')
const middleware = require('./utils/middleware')

const cors = require('cors')

// Collection.hasMany(CollectionFile)

// unnecessary to run after db tables have been set
// sequelize.sync().then(() => console.log('db synced')).catch((err) => {
//   console.error(err)
// })

handle_files.scanThroughFolder()

app.use(cors());
app.use(express.json())

app.use(express.static('public'))

app.use('/api/files', filesRouter)
app.use('/api/collections', collectionsRouter)
app.use('/api/decks', decksRouter)
app.use('/api/exportppt', pptRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app