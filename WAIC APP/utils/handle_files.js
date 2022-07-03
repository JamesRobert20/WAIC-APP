const fs = require("fs")
const pdf = require('pdf-parse')
const path = require('path')
const File = require('../models/File')
const { PDFDocument } = require("pdf-lib")
const { writeFileSync, readFileSync } = require("fs")
const sequelize = require('../sequelize')
const { QueryTypes } = require('sequelize');
const Collection = require("../models/Collection")

const dir = path.join(__dirname, '../public/files/')

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

async function scanThroughFolder() { // scan through files in the 'files' directory, add each file's content and metadata to the sqlite database.

  let filenames = fs.readdirSync(dir);

  filenames.forEach((file) => {

    if (path.extname(file) != ".pdf") { // skip the collection_files directory
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

  const filesInDB = await sequelize.query("SELECT file_name FROM files", { type: QueryTypes.SELECT })

  filesInDB.forEach(file => {
    if (!filenames.includes(file.file_name)) {
      File.destroy({ where: { file_name: file.file_name } })
    }
  })


  const collectionsInDB = await sequelize.query("SELECT collection_name FROM collections", { type: QueryTypes.SELECT })
  collectionsInDB.forEach(collection => {
    if (!filenames.includes(collection.collection_name)) {
      Collection.destroy({ where: { collection_name: collection.collection_name } })
    }
  })
}


// async function createCollectionFile(file, pages, newName, collectionName) {

//   var newDir = dir + "collections/" + collectionName;
//   if (!fs.existsSync(newDir)) {
//     fs.mkdirSync(newDir, {
//       mode: 0o744,
//     });
//     // mode's default value is 0o744
//   }

//   pages = pages.map((ele) => ele - 1)

//   const newDoc = await PDFDocument.create();
//   const oldDoc = await PDFDocument.load(readFileSync(dir + file));

//   const pagesArray = await newDoc.copyPages(oldDoc, pages);

//   for (const page of pagesArray) {
//     newDoc.addPage(page)
//   }

//   writeFileSync(newDir + `/${newName}.pdf`, await newDoc.save());
// }

async function createPDF(fileName, content, directory) {
  const newDoc = await PDFDocument.create();

  for (const page of content) {
    const { fileFrom, pageNumber } = page
    const oldDoc = await PDFDocument.load(readFileSync(dir + fileFrom));

    let pages = await newDoc.copyPages(oldDoc, [parseInt(pageNumber)-1]);
    newDoc.addPage(pages[0])
  }
  writeFileSync(directory + `${fileName}.pdf`, await newDoc.save());


}

async function createCollection(collectionName, collectionFiles) {
  var newDir = dir + `collections/${collectionName}/`;

  // create directory for collection if it doesn't exist
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, {
      mode: 0o744,
    });
  }

  for (const newFile of collectionFiles) {
    if (newFile.exportAs != "Powerpoint(.pptx)") {
      await createPDF(newFile.fileName, newFile.fileContents, newDir)
    }
  }

}

async function exportPowerpoint(fileName, collectionName)
{

  var theSource = path.join("C:\\Users\\jmtendamema\\Downloads\\", fileName+ ".pptx");
  var theDestination = path.join(path.join(path.join(dir, "collections"),collectionName), fileName+ ".pptx");

  console.log("The source is: ");
  console.log(theSource);
  console.log("\nThe destination is: ");
  console.log(theDestination);

  fs.copyFile( theSource, theDestination,
      (err) =>
      {
          if (err) throw err;
          console.log('File was copied to destination');
      }
  );

  // destination will be created or overwritten by default.
  /* fs.copyFile("C:/Users/jmtendamema/Downloads/" + fileName + ".pptx",
    "C:/Users/jmtendamema/Desktop/waic-backend/public/files/collections/"+collectionName + "/" + fileName,
    (err) =>
    {
        if (err) throw err;
        console.log('File was copied to destination');
    }
  ); */
}

module.exports = {
  scanThroughFolder,
  createCollection,
  createPDF,
  exportPowerpoint
}
