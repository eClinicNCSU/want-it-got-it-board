// Rasterizes scripts/icon.svg into the PWA icon PNGs under public/.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { readFileSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const iconPath = fileURLToPath(new URL('./icon.svg', import.meta.url))
const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))

const svg = readFileSync(iconPath)

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['maskable-512x512.png', 512],
  ['apple-touch-icon-180x180.png', 180],
]

for (const [name, size] of targets) {
  await sharp(svg).resize(size, size).png().toFile(pub(name))
  console.log('wrote', name)
}

// Keep an SVG favicon alongside the PNGs.
copyFileSync(iconPath, pub('favicon.svg'))
console.log('wrote favicon.svg')
