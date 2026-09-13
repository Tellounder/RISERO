import { access, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const knowledgeDirectory = resolve(root, 'knowledge')

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
}

function chunksFromMarkdown(file, contents) {
  const lines = contents.split(/\r?\n/)
  const chunks = []
  let heading = 'Introducción'
  let body = []

  const flush = () => {
    const text = body.join('\n').trim()
    if (text) chunks.push({ file, heading, text })
    body = []
  }

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      flush()
      heading = line.replace(/^##\s+/, '').trim()
    } else {
      body.push(line)
    }
  }
  flush()
  return chunks
}

async function search(query) {
  const normalizedQuery = normalize(query.trim())
  if (!normalizedQuery) throw new Error('Indicá un tema. Ejemplo: npm run context:search -- "Firebase admin"')

  const tokens = [...new Set(normalizedQuery.split(/[^a-z0-9]+/).filter((token) => token.length >= 2))]
  const files = (await readdir(knowledgeDirectory)).filter(
    (file) => file.endsWith('.md') && file !== 'README.md',
  )
  const chunks = []

  for (const file of files) {
    const contents = await readFile(resolve(knowledgeDirectory, file), 'utf8')
    chunks.push(...chunksFromMarkdown(file, contents))
  }

  const ranked = chunks
    .map((chunk) => {
      const heading = normalize(chunk.heading)
      const text = normalize(chunk.text)
      let score = text.includes(normalizedQuery) ? 12 : 0
      for (const token of tokens) {
        if (heading.includes(token)) score += 6
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const matches = text.match(new RegExp(`\\b${escaped}`, 'g'))
        score += Math.min(matches?.length ?? 0, 5)
      }
      return { ...chunk, score }
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (!ranked.length) {
    console.log(`Sin coincidencias para: ${query}`)
    return
  }

  console.log(`Contexto recuperado para: ${query}\n`)
  for (const chunk of ranked) {
    console.log(`--- ${chunk.file} > ${chunk.heading} [${chunk.score}] ---`)
    console.log(`${chunk.text}\n`)
  }
}

async function check() {
  const requiredPaths = [
    'AGENTS.md',
    'README.md',
    'knowledge/README.md',
    'knowledge/CANONICAL_CONTEXT.md',
    'scripts/context.mjs',
    'src/App.tsx',
    'src/Admin.tsx',
    'src/projectCards.ts',
    'src/firebase.ts',
    'public/robots.txt',
    'public/sitemap.xml',
    'firebase.json',
    'firestore.rules',
    '.firebaserc',
  ]

  for (const path of requiredPaths) await access(resolve(root, path))

  const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  const projectCards = await readFile(resolve(root, 'src/projectCards.ts'), 'utf8')
  const admin = await readFile(resolve(root, 'src/Admin.tsx'), 'utf8')
  const rules = await readFile(resolve(root, 'firestore.rules'), 'utf8')
  const indexHtml = await readFile(resolve(root, 'index.html'), 'utf8')
  const robots = await readFile(resolve(root, 'public/robots.txt'), 'utf8')
  const sitemap = await readFile(resolve(root, 'public/sitemap.xml'), 'utf8')
  const firebaseAlias = JSON.parse(await readFile(resolve(root, '.firebaserc'), 'utf8'))

  const failures = []
  if (!packageJson.scripts?.['context:search']) failures.push('Falta el script context:search')
  if (!packageJson.scripts?.['context:check']) failures.push('Falta el script context:check')
  if (!projectCards.includes('MAX_PROJECT_CARDS = 15')) failures.push('El límite canónico no es de 15 cards')
  if (!admin.includes('MAX_PROJECT_CARDS')) failures.push('Admin no aplica el límite compartido de cards')
  if (!rules.includes('request.resource.data.order < 15')) failures.push('Las reglas no restringen order al rango de 15 cards')
  if (!indexHtml.includes('rel="canonical" href="https://risedifusion.com.ar/"')) failures.push('Canonical incorrecto')
  if (indexHtml.includes('https://risedifusion.web.app/')) failures.push('El SEO aún referencia web.app')
  if (!indexHtml.includes('https://www.instagram.com/tellounder/')) failures.push('Falta la autoría de Tellounder')
  if (!robots.includes('Disallow: /admin')) failures.push('robots.txt no bloquea /admin')
  if (!robots.includes('https://risedifusion.com.ar/sitemap.xml')) failures.push('robots.txt no referencia el sitemap canónico')
  if (!sitemap.includes('<loc>https://risedifusion.com.ar/</loc>')) failures.push('Sitemap incorrecto')
  if (firebaseAlias.projects?.default !== 'risedifusion') failures.push('El alias Firebase no apunta a risedifusion')

  if (failures.length) {
    console.error('Contexto inconsistente:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    return
  }

  console.log('Contexto local consistente.')
  console.log('Cards máximas: 15')
  console.log(`Firebase: ${firebaseAlias.projects.default}`)
  console.log('Dominio: https://risedifusion.com.ar/')
}

const [command, ...args] = process.argv.slice(2)

if (command === 'search') await search(args.join(' '))
else if (command === 'check') await check()
else {
  console.log('Uso: node scripts/context.mjs search "tema" | check')
  process.exitCode = 1
}
