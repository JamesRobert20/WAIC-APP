const express = require('express');
const app = express();
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

handle_files.scanThroughFolder()

app.use(cors());
app.use(express.json())
app.use(express.static('public'));
app.use('/api/files', filesRouter)
app.use('/api/collections', collectionsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})