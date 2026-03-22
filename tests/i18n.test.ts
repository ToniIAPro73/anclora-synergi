import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPrivateEstatesHref } from '@/lib/i18n'

test('buildPrivateEstatesHref preserves private-area deep link and appends lang', () => {
  const previous = process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL
  process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL =
    'https://anclora-private-estates.vercel.app/?open=private-area'

  try {
    const href = buildPrivateEstatesHref('es')
    const url = new URL(href)

    assert.equal(url.origin, 'https://anclora-private-estates.vercel.app')
    assert.equal(url.searchParams.get('open'), 'private-area')
    assert.equal(url.searchParams.get('lang'), 'es')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL
    else process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PARTNER_ENTRY_URL = previous
  }
})
