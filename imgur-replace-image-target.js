const path = require('path')
const fs = require('fs')

const pagesDir = path.join(__dirname, 'articles', 'modules', 'ROOT', 'pages')
const imgurImageReplaceMacroRx = /(image::?)(https?:\/\/(:?i\.)?imgur.com\/([a-zA-Z0-9]+\.(png|jpe?g)))\[([^\]]*)]/g

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
            let imageName = args[3]
            const fileExtension = args[4]
            const attributesList = args[5]
            const description = attributesList.split(',')[0]
            if (description && description !== 'image' && !description.includes('=')) {
              imageName = description.toLowerCase().replace(/\s/g, '-') + '.' + fileExtension
            } else {
              imageName = file.replace(/\.adoc$/, '') + '-' + imageName
            }
            return `${imageMacro}${imageName}[${attributesList}]`
          }))
        }
        fs.writeFileSync(filePath, data.join('\n'), 'utf8')
      }
    }
  } catch (err) {
    console.error('Error', err)
  }
})()