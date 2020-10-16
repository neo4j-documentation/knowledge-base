const axios = require('axios')
const process = require('process')
const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync;

const s3ImageMacroRx = /image::?(https:\/\/s3.amazonaws.com\/support.neotechnology.com\/KBs\/([^.]+\.(png|jpe?g)))\[([^\]]*)]/g
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
          const matches = [...line.matchAll(s3ImageMacroRx)]
          if (matches && matches.length > 0) {
            console.log(`- ${file}`)
            for (const match of matches) {
              let imageUrl = match[1]
              let imageName = match[2]
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
    const awsS3SyncCommand = `aws s3 sync . s3://dev.assets.neo4j.com/kb-content --acl public-read${profileOption}`;
    console.log(awsS3SyncCommand)
    const result = execSync(awsS3SyncCommand, {
      cwd: buildDir
    })
    console.log(result.toString('utf8'))
  } catch (err) {
    console.error('Error', err)
  }
})()
