const fs = require("fs")
const pdf = require('pdf-parse')
const path = require('path')
const File = require('../models/File')
const dir = path.join(__dirname, '../files/')
const { PDFDocument } = require("pdf-lib")
const { writeFileSync, readFileSync } = require("fs")

function createFile(file) {
  const { file_name, numpages, author, created, mod, text } = file;
  File.create(
    {
      file_name: file_name,
      num_pages: numpages,
      file_author: author,
      date_created: created,
      last_modified: mod,
      text_content: text,
    }
  )
}

function isNewFile(filename) {
  return File.count({ where: { file_name: filename } }).then(count => {
    return count === 0
  })
}

function scanThroughFolder() { // scan through files in the 'files' directory, add each file's content and metadata to the sqlite database.

  let filenames = fs.readdirSync(dir);

  filenames.forEach((file) => {

    if (file == "collection_files") { // skip the collection_files directory
      return;
    }

    let dataBuffer = fs.readFileSync(dir + file);
    pdf(dataBuffer).then(function (data) {
      const { info } = data
      let createDate = info.CreationDate !== undefined ? info.CreationDate.slice(2, 6) + "-" + info.CreationDate.slice(6, 8) + "-" + info.CreationDate.slice(8, 10) : ''
      let modDate = info.ModDate !== undefined ? info.ModDate.slice(2, 6) + "-" + info.ModDate.slice(6, 8) + "-" + info.ModDate.slice(8, 10) : ''
      const stats = fs.statSync(dir + file);

      if (createDate == "") {
        createDate = (stats.ctime).toISOString()
          .replace(/(.*)T(.*)\..*/, '$1 $2').substring(0, 10)
      }

      if (modDate == "") {
        modDate = (stats.mtime).toISOString()
          .replace(/(.*)T(.*)\..*/, '$1 $2').substring(0, 10)
      }

      isNewFile(file).then(isUnique => {
        if (isUnique) {
          createFile(
            {
              file_name: file,
              numpages: data.numpages,
              author: info.Author,
              created: createDate,
              mod: modDate,
              text: data.text,
            }
          )
        }
      })

    });
  });

}

async function createCollectionFile(file, pages, newName) {
  pages = pages.map((ele) => ele - 1)

  const newDoc = await PDFDocument.create();
  const oldDoc = await PDFDocument.load(readFileSync(dir + file));

  const pagesArray = await newDoc.copyPages(oldDoc, pages);

  for (const page of pagesArray) {
    newDoc.addPage(page)
  }
  writeFileSync(dir + `collection_files/${newName}.pdf`, await newDoc.save());
}


module.exports = {
  scanThroughFolder,
  createCollectionFile
}
