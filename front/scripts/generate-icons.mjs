import sharp from 'sharp'
import { mkdirSync } from 'fs'

const source = './public/logo.png'
const outDir = './public/icons'
const bgColor = { r: 102, g: 126, b: 234, alpha: 1 }

mkdirSync(outDir, { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: bgColor })
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`)
  console.log(`Generated ${size}x${size}`)
}

console.log('\nGenerating screenshots...')

const screenshots = [
  { width: 1280, height: 720, name: 'screenshot-desktop', label: 'Desktop' },
  { width: 390, height: 844, name: 'screenshot-mobile', label: 'Mobile' }
]

for (const ss of screenshots) {
  const logoSize = Math.min(ss.width, ss.height) * 0.6
  
  const logoBuffer = await sharp(source)
    .resize(Math.round(logoSize), Math.round(logoSize), { fit: 'contain' })
    .toBuffer()
  
  const logoMeta = await sharp(logoBuffer).metadata()
  
  const left = Math.round((ss.width - logoMeta.width) / 2)
  const top = Math.round((ss.height - logoMeta.height) / 2)
  
  await sharp({
    create: {
      width: ss.width,
      height: ss.height,
      channels: 4,
      background: bgColor
    }
  })
    .composite([{
      input: logoBuffer,
      left: left,
      top: top
    }])
    .png()
    .toFile(`${outDir}/${ss.name}.png`)
  
  const metadata = await sharp(`${outDir}/${ss.name}.png`).metadata()
  console.log(`Generated ${ss.name} (${metadata.width}x${metadata.height}) - ${ss.label}`)
}

console.log('\nDone!')
