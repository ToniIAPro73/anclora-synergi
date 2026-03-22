import test from 'node:test'
import assert from 'node:assert/strict'
import { generateInviteCode, hashSecret, verifySecret } from '@/lib/passwords'

test('hashSecret and verifySecret validate the original secret', () => {
  const secret = 'Partner-Code-123'
  const hashed = hashSecret(secret)

  assert.equal(typeof hashed, 'string')
  assert.ok(hashed.includes(':'))
  assert.equal(verifySecret(secret, hashed), true)
  assert.equal(verifySecret('wrong-secret', hashed), false)
})

test('generateInviteCode returns an uppercase code with content', () => {
  const inviteCode = generateInviteCode()

  assert.ok(inviteCode.length >= 6)
  assert.equal(inviteCode, inviteCode.toUpperCase())
})
