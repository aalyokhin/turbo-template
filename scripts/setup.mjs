#!/usr/bin/env node
// One-shot rename: replaces the template's placeholder name with your project's.
// Usage: pnpm setup [project-name]
//
// Only the human-facing project name changes (root package.json name, Docker
// image name, page title, header). The internal `@repo/*` workspace scope is
// left as-is — it's the Turborepo convention for private packages and never
// published, so renaming it would be churn with no benefit.

import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout, argv } from 'node:process'

const SLUG = 'turbo-template'
const DISPLAY = 'Turbo Template'

// (file, find, replace) — `replace` is computed from the chosen name.
const edits = (slug, display) => [
  ['package.json', `"name": "${SLUG}"`, `"name": "${slug}"`],
  ['.github/workflows/ci.yml', `IMAGE_NAME: ${SLUG}`, `IMAGE_NAME: ${slug}`],
  ['apps/web/index.html', `<title>${DISPLAY}</title>`, `<title>${display}</title>`],
  ['apps/web/src/routes/__root.tsx', DISPLAY, display],
]

function toSlug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function toDisplay(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

async function main() {
  let input = argv[2]
  if (!input) {
    const rl = createInterface({ input: stdin, output: stdout })
    input = await rl.question('Project name: ')
    rl.close()
  }

  const slug = toSlug(input)
  if (!slug) {
    console.error('Invalid project name.')
    process.exit(1)
  }
  const display = toDisplay(slug)

  for (const [file, find, replace] of edits(slug, display)) {
    const content = await readFile(file, 'utf8')
    if (!content.includes(find)) {
      console.warn(`  skip ${file} (placeholder not found — already renamed?)`)
      continue
    }
    await writeFile(file, content.replaceAll(find, replace))
    console.log(`  updated ${file}`)
  }

  console.log(`\nRenamed to "${display}" (${slug}). Review the changes, then commit.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
