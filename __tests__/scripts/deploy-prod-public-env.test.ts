import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { setup } from './deploy-prod-harness'

// 2026-10-14, in amar-gupta-admin: NEXT_PUBLIC_APP_URL was a Sensitive variable, `vercel pull` wrote it empty, and the
// Mac build inlined '' into every bundle. Here the same would blank the Supabase client in the browser. Vercel docs:
// sensitive values cannot be read back (https://vercel.com/docs/environment-variables/sensitive-environment-variables).
// A NEXT_PUBLIC_* value is fixed at build time, so the deploy refuses to build with one empty.
describe('scripts/deploy-prod.sh — public variables baked at build time', () => {
  it('refuses before starting Docker when a NEXT_PUBLIC_ variable pulled empty, and names it', () => {
    const { commandLog, run, work } = setup()
    const result = run({ PULL_ENV: 'NEXT_PUBLIC_SUPABASE_URL="https://x.supabase.co"\nNEXT_PUBLIC_SUPABASE_ANON_KEY=""\nSECRET="s"\n' })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(result.stderr).toContain('--no-sensitive')
    expect(result.stderr).not.toContain('NEXT_PUBLIC_SUPABASE_URL')
    expect(commandLog().some((line) => line.startsWith('colima'))).toBe(false)
    expect(existsSync(join(work, '.vercel/.env.production.local'))).toBe(false)
  })

  it('builds when every NEXT_PUBLIC_ variable has a value, even if a server-only one pulled empty', () => {
    const { run } = setup()
    const result = run({ PULL_ENV: 'NEXT_PUBLIC_SUPABASE_URL="https://x.supabase.co"\nAMARGUPTA_MCP_BEARER=""\n' })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })
})
