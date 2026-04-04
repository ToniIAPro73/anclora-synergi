import test from 'node:test'
import assert from 'node:assert/strict'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

test('synergi brand constants stay aligned with the premium contract', () => {
  assert.equal(SYNERGI_BRAND.name, 'Anclora Synergi')
  assert.equal(SYNERGI_BRAND.logoPath, '/brand/logo-anclora-synergi.png')
  assert.equal(SYNERGI_BRAND.faviconPath, '/favicon.ico')
  assert.equal(SYNERGI_BRAND.premiumAccent, '#8C5AB4')
  assert.equal(SYNERGI_BRAND.premiumCopper, '#C07860')
  assert.equal(SYNERGI_BRAND.premiumInterior, '#1C162A')
  assert.equal(SYNERGI_BRAND.premiumTypography, 'DM Sans')
})
