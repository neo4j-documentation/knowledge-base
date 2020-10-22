const path = require('path')
const fs = require('fs')

const pagesDir = path.join(__dirname, 'articles', 'modules', 'ROOT', 'pages')
const imgurImageReplaceMacroRx = /(image::?)(https:\/\/s3.amazonaws.com\/support.neotechnology.com\/KBs\/([^.]+\.(png|jpe?g)))\[([^\]]*)]/g

;(async () => {
  try {
    const asciidocFiles = fs.readdirSync(pagesDir)
    for (const file of asciidocFiles) {
      if (file.endsWith('.adoc')) {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split(/\r?\n/)
        const data = []
        for (const line of lines) {
          data.push(line.replace(imgurImageReplaceMacroRx, (replace, ...args) => {
            const imageMacro = args[0]
            let imageName = args[2]
            const attributesList = args[4]
            return `${imageMacro}https://s3.amazonaws.com/dev.assets.neo4j.com/kb-content/${imageName}[${attributesList}]`
          }))
        }
        fs.writeFileSync(filePath, data.join('\n'), 'utf8')
      }
    }
  } catch (err) {
    console.error('Error', err)
  }
})()
