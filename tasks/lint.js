const path = require('path')
const fs = require('fs')
const asciidoctor = require('@asciidoctor/core')()
const slugChecker = require('./linter/slug.js')

const IGNORE_FILES = ['index.adoc', 'categories.adoc', 'tags.adoc']
const rootDir = path.join(__dirname, '..')
const articlesDir = path.resolve(path.join(rootDir, 'articles', 'modules', 'ROOT', 'pages'))

const articleFiles = fs.readdirSync(articlesDir)
const annotations = []

const slugs = {}
for (const articleFile of articleFiles) {
  if (articleFile.endsWith('.adoc') && !IGNORE_FILES.includes(articleFile)) {
    const filePath = path.join(articlesDir, articleFile)
    const doc = asciidoctor.loadFile(filePath)
    annotations.push(...slugChecker.check(doc, articleFile, slugs))
  }
}

annotations.push(...slugChecker.unique(slugs))

if (annotations.length > 0) {
  fs.writeFileSync('annotations.json', JSON.stringify(annotations), 'utf8')
  process.exit(1)
}