// Renders the placeholder PWA icons from the fox SVG.
// Run: NODE_PATH=$(npm root -g) node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// Playwright is pre-installed globally in the dev container; set NODE_PATH to its root.
const { chromium } = createRequire(import.meta.url)('playwright')

const fox = readFileSync('src/assets/characters/fox.svg', 'utf8').replace(/<\?xml[^>]*>/, '')
const bg = '#17224A'

// Maskable icons keep the art inside the central 80% safe zone.
const variants = [
  { file: 'public/icons/icon-192.png', size: 192, art: 0.86 },
  { file: 'public/icons/icon-512.png', size: 512, art: 0.86 },
  { file: 'public/icons/maskable-512.png', size: 512, art: 0.62 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, art: 0.8 },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const v of variants) {
  const art = Math.round(v.size * v.art)
  await page.setViewportSize({ width: v.size, height: v.size })
  await page.setContent(
    `<body style="margin:0;width:${v.size}px;height:${v.size}px;background:${bg};display:flex;align-items:center;justify-content:center">
       <div style="width:${art}px;height:${art}px">${fox.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"')}</div>
     </body>`,
  )
  writeFileSync(v.file, await page.screenshot({ type: 'png' }))
}
await browser.close()
