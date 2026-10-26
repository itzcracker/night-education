import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataFile = path.join(root, 'data/games.ts')
const coversDir = path.join(root, 'public/covers')
let source = await fs.readFile(dataFile, 'utf8')
const entries = [...source.matchAll(/game\('([^']+)'[^\n]*?'(https?:\/\/[^']+)'\)/g)]
await fs.mkdir(coversDir, { recursive: true })

for (const [, slug, url] of entries) {
  const ext = new URL(url).pathname.match(/\.(avif|webp|jpe?g|png)$/i)?.[1]?.toLowerCase() || 'webp'
  const filename = `${slug}.${ext === 'jpeg' ? 'jpg' : ext}`
  const destination = path.join(coversDir, filename)
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()))
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    source = source.replace(new RegExp(escaped, 'g'), `/covers/${filename}`)
    await fs.writeFile(dataFile, source)
  } catch (error) {
    console.error(`Failed to download ${slug}: ${error.message}`)
  }
}

const shortcutImages = {
  'https://i.ibb.co/RTms32YG/image.png': 'shortcut-tiktok.png',
  'https://i.ibb.co/TDxRv3Gf/image.png': 'shortcut-youtube.png',
  'https://i.ibb.co/TBTSXjCZ/image.png': 'shortcut-discord.png',
  'https://i.ibb.co/zVZdcXPx/image.png': 'shortcut-x.png',
  'https://i.ibb.co/8g0gNNxn/image.png': 'shortcut-geforce.png',
  'https://i.ibb.co/YBDJCrtt/image.png': 'shortcut-geoguessr.png',
  'https://i.ibb.co/FkWBj9cc/image.png': 'shortcut-worldguessr.png',
}
const pageFile = path.join(root, 'app/page.tsx')
let page = await fs.readFile(pageFile, 'utf8')
for (const [url, filename] of Object.entries(shortcutImages)) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download shortcut image: ${url}`)
  await fs.writeFile(path.join(coversDir, filename), Buffer.from(await response.arrayBuffer()))
  page = page.replaceAll(url, `/covers/${filename}`)
}
await fs.writeFile(pageFile, page)
console.log(`Processed ${entries.length} external game covers and ${Object.keys(shortcutImages).length} shortcut icons.`)
