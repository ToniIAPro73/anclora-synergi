import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSynergiAbsoluteUrl } from '@/lib/app-url'

test('buildSynergiAbsoluteUrl uses explicit NEXT_PUBLIC_APP_URL when provided', () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL
  process.env.NEXT_PUBLIC_APP_URL = 'https://anclora-synergi.vercel.app'

  try {
    assert.equal(
      buildSynergiAbsoluteUrl('/login?email=test@example.com'),
      'https://anclora-synergi.vercel.app/login?email=test@example.com'
    )
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL
    else process.env.NEXT_PUBLIC_APP_URL = previous
  }
})
