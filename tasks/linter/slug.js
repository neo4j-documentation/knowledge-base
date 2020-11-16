const path = require('path')
const fs = require('fs')
const logger = require('../extra/logger.js')

const rootDir = path.join(__dirname, '..', '..')
const articlesDir = path.resolve(path.join(rootDir, 'articles', 'modules', 'ROOT', 'pages'))
const relativeArticlesDir = path.relative(rootDir, articlesDir)

function check(doc, articleFile, slugs) {
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
  } else {
    if (slug !== articleFile.replace(/\.adoc$/, '')) {
      logger.error(`The file name '${articleFile}' must match the slug attribute '${slug}'.`)
      annotations.push({
        file: relativeArticleFilePath,
        line: 0,
        title: 'Invalid :slug: attribute',
        annotation_level: 'failure',
        message: `The file name '${articleFile}' is invalid, it must match the slug attribute '${slug}'.`
      })
    }
    const files = slugs[slug] || []
    files.push({
      relative: relativeArticleFilePath,
      basename: articleFile
    })
    slugs[slug] = files
  }
  return annotations
}

function unique(slugs) {
  const annotations = []
  for (const [slug, files] of Object.entries(slugs)) {
    if (files.length > 1) {
      // slug is not unique.
      const errorMessage = `The slug attribute '${slug}' must be unique, found ${files.length} occurrences in [${files.map((file) => `'${file.basename}'`).join(', ')}].`;
      logger.error(errorMessage)
      for (const file of files) {
        annotations.push({
          file: file.relative,
          line: 0,
          title: 'Invalid :slug: attribute',
          annotation_level: 'failure',
          message: errorMessage
        })
      }
    }
  }
  return annotations
}

module.exports = {
  check: check,
  unique: unique
}