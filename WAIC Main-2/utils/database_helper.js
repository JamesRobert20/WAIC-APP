const sequelize = require('../sequelize')
const File = require('../models/File')
const { QueryTypes } = require('sequelize');


async function searchFiles(file_name, content, dateCreatedBefore, dateCreatedAfter, author, lastModBefore, lastModAfter, numPagesMin, numPagesMax) {
  let searchQuery = `SELECT *,"" as text_content FROM files WHERE 1=1 `

  if (file_name) {
    searchQuery += `AND file_name LIKE '%${file_name}%' `
  }
  if (content) {
    searchQuery += `AND text_content LIKE '%${content}%' `
  }

  if (dateCreatedBefore) {
    searchQuery += `AND date_created < date("${dateCreatedBefore}") `
  }

  if (dateCreatedAfter) {
    searchQuery += `AND date_created > date("${dateCreatedAfter}") `
  }

  if (author) {
    searchQuery += `AND file_author = '${author}' `
  }

  if (lastModBefore) {
    searchQuery += `AND last_modified < date("${lastModBefore}") `
  }

  if (lastModAfter) {
    searchQuery += `AND last_modified > date("${lastModAfter}") `
  }
  if (numPagesMin) {
    searchQuery += `AND num_pages >= ${numPagesMin} `
  }
  if (numPagesMax) {
    searchQuery += `AND num_pages <= ${numPagesMax}`
  }
  return await sequelize.query(searchQuery, { type: QueryTypes.SELECT })
}

module.exports = {
  searchFiles,
}