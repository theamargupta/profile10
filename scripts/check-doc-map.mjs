#!/usr/bin/env node
// Keeps docs/DOC-MAP.md honest.
//
// The map's whole value is that its versions match what is installed — a doc
// read at the wrong version is worse than no doc. The map says "bump a
// dependency, fix its row in the same commit", which until now was a promise
// with nothing behind it. This is what is behind it.
//
// Exit 0 = every watched package's row agrees with node_modules.
// Exit 1 = at least one row is stale. The message names the row and both versions.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Packages whose docs are version-sensitive enough to have earned a row.
// label = how the row names it in the map, so the error message is greppable.
const WATCHED = [
  { pkg: 'next', label: 'Next.js' },
  { pkg: 'three', label: 'three' },
  { pkg: '@react-three/fiber', label: '@react-three/fiber' },
  { pkg: 'gsap', label: 'GSAP' },
  { pkg: 'framer-motion', label: 'framer-motion' },
  { pkg: 'lenis', label: 'Lenis' },
  { pkg: 'react', label: 'React' },
  { pkg: '@playwright/test', label: 'Playwright' },
  { pkg: 'vitest', label: 'vitest' },
  { pkg: 'zod', label: 'Zod' },
  { pkg: '@supabase/ssr', label: 'Supabase' },
  { pkg: 'tailwindcss', label: 'Tailwind' },
]

function installedVersion(pkg) {
  try {
    return JSON.parse(
      readFileSync(join(root, 'node_modules', pkg, 'package.json'), 'utf8'),
    ).version
  } catch {
    return null // not installed — reported, not fatal
  }
}

function main() {
  let map
  try {
    map = readFileSync(join(root, 'docs', 'DOC-MAP.md'), 'utf8')
  } catch {
    console.error('docs/DOC-MAP.md is missing. Building it IS step 1 of the build loop.')
    process.exit(1)
  }

  // Only rows at/after a "## The stack" heading count. A map may carry other
  // tables (e.g. a "this repo is NOT like the others" comparison) whose cells
  // name versions that are deliberately not this repo's.
  const stackAt = map.indexOf('## The stack')
  const scoped = stackAt === -1 ? map : map.slice(stackAt)
  const rows = scoped.split('\n').filter((l) => l.trim().startsWith('|'))
  const stale = []
  const missing = []
  const ok = []

  for (const { pkg, label } of WATCHED) {
    const installed = installedVersion(pkg)
    if (!installed) {
      missing.push(`${label} (${pkg}) — not installed; run npm install`)
      continue
    }

    // Match the label in the FIRST cell only — the same cell the version is read
    // from. Matching the whole row let a label mentioned in another row's prose
    // (e.g. "Lenis" named inside the framer-motion row) hijack the wrong version.
    const row = rows.find((l) =>
      (l.split('|')[1] ?? '').toLowerCase().includes(label.toLowerCase()),
    )
    if (!row) {
      missing.push(`${label} — installed at ${installed} but has no row in DOC-MAP.md`)
      continue
    }

    // The version the row claims, taken from the first cell only. Later cells
    // cite doc paths and API versions (v16.1.0, v23.0, 202606) that are not
    // package versions and must not be compared against node_modules.
    const firstCell = row.split('|')[1] ?? ''
    const claimed = firstCell.match(/\d+(?:\.\d+)*/g) ?? []

    if (claimed.length === 0) {
      missing.push(`${label} — row names no version; installed is ${installed}`)
      continue
    }

    // A row may pin loosely ("Tailwind 4") or exactly ("Next.js 16.1.0").
    // Whatever precision it chose, it must be a prefix of the installed version.
    const agrees = claimed.some(
      (c) => installed === c || installed.startsWith(`${c}.`),
    )

    if (agrees) ok.push(`${label} ${installed}`)
    else stale.push(`${label} — DOC-MAP.md says ${claimed.join('/')}, installed is ${installed}`)
  }

  if (ok.length) console.log(`✓ in sync: ${ok.join(', ')}`)
  for (const m of missing) console.warn(`! ${m}`)

  if (stale.length) {
    console.error('\n✗ DOC-MAP.md is stale — these rows point at the wrong docs:\n')
    for (const s of stale) console.error(`  ${s}`)
    console.error('\nFix the rows, and re-pin the context7 IDs to the new versions.')
    process.exit(1)
  }

  console.log('\nDOC-MAP.md agrees with node_modules.')
}

main()
