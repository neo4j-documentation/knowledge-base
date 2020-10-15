const path = require('path')
const fs = require('fs')
const logger = require('../extra/logger.js')

const rootDir = path.join(__dirname, '..', '..')
const articlesDir = path.resolve(path.join(rootDir, 'articles', 'modules', 'ROOT', 'pages'))
const relativeArticlesDir = path.relative(rootDir, articlesDir)

function check(doc, articleFile) {
  const annotations = []
  const relativeArticleFilePath = path.join(relativeArticlesDir, articleFile)
  const slug = doc.getAttribute('slug')
  if (!slug) {
    logger.warn(`The slug attribute is missing, the file '${articleFile}' won't be published.`)
    annotations.push({
      file: relativeArticleFilePath,
      line: 0,
      title: 'Missing :slug: attribute',
      annotation_level: 'warning',
      message: 'The slug attribute is missing, the file won\'t be published.'
    })
  } else if (!slug.match(/^[a-z0-9-]+$/)) {
    logger.error(`The slug attribute '${slug}' is invalid in '${articleFile}', it must only contains lowercase alphanumeric characters and hyphens.`)
    const articleFilePath = path.join(articlesDir, articleFile)
    const content = fs.readFileSync(articleFilePath, 'utf8')
    const lines = content.split(/\r?\n/)
    const lineNumber = lines.findIndex((line) => line.includes(':slug:')) || 0
    annotations.push({
      file: relativeArticleFilePath,
      line: lineNumber + 1,
      title: 'Invalid :slug: attribute',
      annotation_level: 'failure',
      message: 'The slug attribute is invalid, it must only contains lowercase alphanumeric characters and hyphens.'
    })
  }
  return annotations
}

module.exports = {
  check: check
}