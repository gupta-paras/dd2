import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  hashPassword,
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from '../src/lib/auth';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { GET as sessionHandler } from '../src/app/api/auth/session/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';

describe('Admin Authentication & Security Suite', () => {
  const correctPassword = 'bestFoodInNl@123';
  const wrongPassword = 'wrongPassword@123';
  const adminUser = 'admin';

  it('correctly hashes password using sha256', () => {
    const hash = hashPassword(correctPassword);
    assert.strictEqual(
      hash,
      '5b0885b3479975349c10e21359d69a34187a281e38d1b35300257db059093f5d'
    );
  });

  it('validates credentials using hash comparison', () => {
    assert.strictEqual(verifyAdminCredentials(adminUser, correctPassword), true);
    assert.strictEqual(verifyAdminCredentials(adminUser, wrongPassword), false);
    assert.strictEqual(verifyAdminCredentials('wrongUser', correctPassword), false);
  });

  it('generates HMAC signed session token that verifies correctly', () => {
    const token = createSessionToken('admin');
    assert.ok(token);

    const verification = verifySessionToken(token);
    assert.strictEqual(verification.valid, true);
    assert.strictEqual(verification.user, 'admin');
  });

  it('rejects tampered session tokens', () => {
    const token = createSessionToken('admin');
    const tampered = token + 'tampered';
    const verification = verifySessionToken(tampered);
    assert.strictEqual(verification.valid, false);
  });

  it('POST /api/auth/login succeeds with correct password and sets session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUser, password: correctPassword }),
    });

    const res = await loginHandler(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.user, adminUser);

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes(SESSION_COOKIE_NAME));
    assert.ok(setCookie.includes('HttpOnly'));
  });

  it('POST /api/auth/login rejects invalid password with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUser, password: wrongPassword }),
    });

    const res = await loginHandler(req);
    assert.strictEqual(res.status, 401);

    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  it('POST /api/auth/logout clears session cookie', async () => {
    const res = await logoutHandler();
    assert.strictEqual(res.status, 200);

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes(SESSION_COOKIE_NAME));
  });
});
