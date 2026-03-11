/**
 * Downloads fonts from Google Fonts and embeds them as base64 data URIs
 * directly in public/icon.svg so that qlmanage (and any other renderer)
 * can render the fonts without needing network access.
 *
 * Usage: node scripts/embed-fonts.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SVG_PATH = resolve(__dirname, '../public/icon.svg')

const FONTS = [
  { family: 'Bebas Neue', weight: 400 },
  { family: 'Brygada 1918', weight: 400 },
]

async function fetchFontBase64(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const css = await fetch(url, {
    headers: {
      // Request woff2 — a desktop UA is needed to get modern format URLs
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  }).then((r) => r.text())

  const match = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)
  if (!match) throw new Error(`No font URL found in Google Fonts CSS for "${family}"`)

  const fontUrl = match[1]
  const buffer = await fetch(fontUrl).then((r) => r.arrayBuffer())
  return Buffer.from(buffer).toString('base64')
}

async function main() {
  console.log('Downloading fonts from Google Fonts...')

  const fontFaces = await Promise.all(
    FONTS.map(async ({ family, weight }) => {
      process.stdout.write(`  ${family} ${weight}... `)
      const b64 = await fetchFontBase64(family, weight)
      console.log(`done (${Math.round((b64.length * 3) / 4 / 1024)} KB)`)
      return `@font-face { font-family: '${family}'; src: url('data:font/woff2;base64,${b64}') format('woff2'); font-weight: ${weight}; font-style: normal; }`
    }),
  )

  const embeddedStyle = `<style>\n    ${fontFaces.join('\n    ')}\n  </style>`

  let svg = readFileSync(SVG_PATH, 'utf8')
  svg = svg.replace(/<style>[\s\S]*?<\/style>/, embeddedStyle)
  writeFileSync(SVG_PATH, svg)

  console.log(`\nFonts embedded into ${SVG_PATH}`)
  console.log('\nRun icon generation:')
  console.log(
    '  mkdir -p /tmp/icon_render && qlmanage -t -s 512 -o /tmp/icon_render/ public/icon.svg',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
