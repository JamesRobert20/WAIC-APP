const filesRouter = require('express').Router()
const path = require('path')
const fs = require("fs")
//const File = require('../models/File')
//const database_helper = require('../utils/database_helper')

filesRouter.get('/', async (req, res) => {
  const direc = path.join(__dirname, '../public/files/')
  let theFiles = []
  let allFilesDone = []

  const getTheFiles = new Promise((myresolve, myreject) => {
    fs.readdir(direc, (err, files) => 
    {
      files.forEach(
        function(item)
        {
          var itemPath = path.join(direc, item)
          
          var file_promise = new Promise( (resolve, reject) => {
            fs.stat(itemPath, (error, stats) =>
            {
              if(error)
                console.log(error.message)
              else
              {
                if(stats.isFile())
                {
                  var theStats = stats.mtime
                  theFiles.push({
                    file_name: item,
                    last_modified: { date: theStats.getDate(), month: theStats.getMonth()+1, year: theStats.getFullYear()}
                  })
                  resolve("")
                }
                else
                {
                  resolve("")
                }
              }
            })
          })

          allFilesDone.push(file_promise)
        }
      )
      Promise.all(allFilesDone).then( () => {
        myresolve(theFiles)
      }) 
    })
  })
  
  const Files = await getTheFiles
  return res.json({ files: Files })
})

/* filesRouter.post('/search', async (req, res) => {
  const { file_name, content, dateCreatedBefore, dateCreatedAfter, author, lastModBefore, lastModAfter, numPagesMin, numPagesMax } = req.body
  return res.json({results: await database_helper.searchFiles(file_name, content, dateCreatedBefore, dateCreatedAfter, author, lastModBefore, lastModAfter, numPagesMin, numPagesMax)})
}) */

module.exports = filesRouter
