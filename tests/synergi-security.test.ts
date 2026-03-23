import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRateLimitKey, checkRateLimit, getRequestIp } from '@/lib/synergi-security'
import { resolveAdminCredentials } from '@/lib/admin-auth'

function resetRateLimitStore() {
  ;(globalThis as typeof globalThis & { __ancloraSynergiRateLimits?: Map<string, unknown> }).__ancloraSynergiRateLimits =
    new Map<string, unknown>()
}

test('buildRateLimitKey composes meaningful identifiers', () => {
  assert.equal(buildRateLimitKey(['admin', 'login', '', undefined, '127.0.0.1']), 'admin:login:127.0.0.1')
})

test('checkRateLimit enforces a simple burst window', () => {
  resetRateLimitStore()

  const first = checkRateLimit('synergi:burst:test', 1, 60_000)
  const second = checkRateLimit('synergi:burst:test', 1, 60_000)

  assert.equal(first.allowed, true)
  assert.equal(second.allowed, false)
  assert.equal(typeof second.retryAfterSeconds, 'number')
})

test('getRequestIp prefers x-forwarded-for', () => {
  const request = new Request('https://example.com', {
    headers: {
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      'x-real-ip': '9.9.9.9',
    },
  })

  assert.equal(getRequestIp(request), '1.2.3.4')
})

test('resolveAdminCredentials supports multi-account JSON definitions', () => {
  const previousJson = process.env.SYNERGI_ADMIN_ACCOUNTS_JSON
  const previousUsername = process.env.SYNERGI_ADMIN_USERNAME
  const previousPassword = process.env.SYNERGI_ADMIN_PASSWORD
  const previousRole = process.env.SYNERGI_ADMIN_ROLE

  process.env.SYNERGI_ADMIN_ACCOUNTS_JSON = JSON.stringify([
    { username: 'reviewer', password: 'review-pass', role: 'reviewer' },
    { username: 'operator', password: 'operator-pass', role: 'operator' },
  ])
  delete process.env.SYNERGI_ADMIN_USERNAME
  delete process.env.SYNERGI_ADMIN_PASSWORD
  delete process.env.SYNERGI_ADMIN_ROLE

  try {
    const account = resolveAdminCredentials('operator', 'operator-pass')
    assert.ok(account)
    assert.equal(account?.username, 'operator')
    assert.equal(account?.role, 'operator')
  } finally {
    if (previousJson === undefined) delete process.env.SYNERGI_ADMIN_ACCOUNTS_JSON
    else process.env.SYNERGI_ADMIN_ACCOUNTS_JSON = previousJson

    if (previousUsername === undefined) delete process.env.SYNERGI_ADMIN_USERNAME
    else process.env.SYNERGI_ADMIN_USERNAME = previousUsername

    if (previousPassword === undefined) delete process.env.SYNERGI_ADMIN_PASSWORD
    else process.env.SYNERGI_ADMIN_PASSWORD = previousPassword

    if (previousRole === undefined) delete process.env.SYNERGI_ADMIN_ROLE
    else process.env.SYNERGI_ADMIN_ROLE = previousRole
  }
})
