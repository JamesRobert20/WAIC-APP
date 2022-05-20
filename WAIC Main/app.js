const express = require('express')
const app = express()
const filesRouter = require('./controllers/filesRouter')
const collectionsRouter = require('./controllers/collectionsRouter')

const handle_files = require('./utils/handle_files')
const middleware = require('./utils/middleware')
const sequelize = require('./sequelize')

const File = require('./models/File')
const Collection = require('./models/Collection')
const CollectionFile = require('./models/CollectionFile')
const cors = require('cors')

Collection.hasMany(CollectionFile)

// unnecessary to run after db tables have been set
// sequelize.sync().then(() => console.log('db synced')).catch((err) => {
//   console.error(err)
// })

handle_files.scanThroughFolder()

app.use(cors());
app.use(express.json())
app.use(express.static('public'));
app.use('/api/files', filesRouter)
app.use('/api/collections', collectionsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app



