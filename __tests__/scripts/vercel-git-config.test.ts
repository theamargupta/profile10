import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Spec: docs/specs/manual-prod-deploy.md. Production ships only through scripts/deploy-prod.sh.
describe('Vercel build config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('turns off automatic git deployments for every branch', () => {
    const config = JSON.parse(readFileSync(resolve(__dirname, '../../vercel.json'), 'utf8'))
    expect(config.git?.deploymentEnabled).toBe(false)
  })

  it('skips the TypeScript step only on a Vercel build (deploy-prod.sh type-checks first)', async () => {
    vi.stubEnv('VERCEL', '1')
    const onVercel = (await import('../../next.config')).default
    expect(onVercel.typescript?.ignoreBuildErrors).toBe(true)
  })

  it('keeps the TypeScript step on a local build', async () => {
    vi.stubEnv('VERCEL', '')
    const local = (await import('../../next.config')).default
    expect(local.typescript?.ignoreBuildErrors).toBe(false)
  })
})
