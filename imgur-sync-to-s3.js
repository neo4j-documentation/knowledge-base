const axios = require('axios')
const process = require('process')
const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync;

const imgurImageMacroRx = /image::?(https?:\/\/(:?i\.)?imgur.com\/([a-zA-Z0-9]+\.(png|jpe?g)))\[([^\]]*)]/g
const pagesDir = path.join(__dirname, 'articles', 'modules', 'ROOT', 'pages')
const buildDir = path.join(__dirname, 'build', 's3', 'images')
fs.mkdirSync(buildDir, { recursive: true })

// clean build/s3/images directory
const imageFiles = fs.readdirSync(buildDir)
for (const file of imageFiles) {
  fs.unlinkSync(path.join(buildDir, file))
}

async function getImage(url) {
  console.log(`\tGET ${url}`)
  return axios({
    method: 'get',
    url,
    responseType: 'stream'
  })
}

;(async () => {
  try {
    const asciidocFiles = fs.readdirSync(pagesDir)
    for (const file of asciidocFiles) {
      if (file.endsWith('.adoc')) {
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf8')
        const lines = content.split(/\r?\n/)
        for (const line of lines) {
          const matches = [...line.matchAll(imgurImageMacroRx)]
          if (matches && matches.length > 0) {
            console.log(`- ${file}`)
            for (const match of matches) {
              let imageUrl = match[1]
              let imageName = match[3]
              if (imageUrl.startsWith('http://')) {
                imageUrl = `https://i.imgur.com/${imageName}`
              }
              const fileExtension = match[4]
              const attributesList = match[5]
              const description = attributesList.split(',')[0]
              if (description && description !== 'image' && !description.includes('=')) {
                imageName = description.toLowerCase().replace(/\s/g, '-') + '.' + fileExtension
              } else {
                imageName = file.replace(/\.adoc$/, '') + '-' + imageName
              }
              const response = await getImage(imageUrl)
              const imagePath = path.join(buildDir, imageName)
              console.log(`\twriting image to ${imagePath}`)
              response.data.pipe(fs.createWriteStream(imagePath))
            }
          }
        }
      }
    }
    const profileOption = process.env.AWS_PROFILE ? ` --profile ${process.env.AWS_PROFILE}` : ''
    const awsS3SyncCommand = `aws s3 sync . s3://support.neotechnology.com/KBs --acl public-read${profileOption}`;
    console.log(awsS3SyncCommand)
    const result = execSync(awsS3SyncCommand, {
      cwd: buildDir
    })
    console.log(result.toString('utf8'))
  } catch (err) {
    console.error('Error', err)
  }
})()