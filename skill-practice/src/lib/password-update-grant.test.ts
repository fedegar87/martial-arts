import assert from "node:assert/strict";
import test from "node:test";
import { createPasswordUpdateGrant, verifyPasswordUpdateGrant } from "./password-update-grant.ts";

const identity = { sub: "dummy-user", session_id: "dummy-session" };
const key = "dummy-signing-key-used-only-for-unit-tests";
const now = Date.parse("2026-11-08T09:00:00Z");

test("password update requires a signed grant for the same user and session", () => {
  const grant = createPasswordUpdateGrant(identity, key, now)!;
  assert.equal(verifyPasswordUpdateGrant(grant, identity, key, now), true);
  assert.equal(verifyPasswordUpdateGrant(grant, { ...identity, sub: "other-user" }, key, now), false);
  assert.equal(verifyPasswordUpdateGrant(grant, { ...identity, session_id: "other-session" }, key, now), false);
  assert.equal(verifyPasswordUpdateGrant(grant, identity, "other-key", now), false);
  const [payload, signature] = grant.split(".");
  const changed = Buffer.from(JSON.stringify({ ...identity, expiresAt: now })).toString("base64url");
  assert.equal(verifyPasswordUpdateGrant(`${changed}.${signature}`, identity, key, now), false);
  assert.equal(verifyPasswordUpdateGrant(`${payload}.invalid`, identity, key, now), false);
});

test("legacy, malformed, missing and expired recovery markers fail closed", () => {
  const grant = createPasswordUpdateGrant(identity, key, now)!;
  for (const marker of [undefined, "1", "arbitrary", ".", "a".repeat(1025), `${grant}.extra`]) {
    assert.equal(verifyPasswordUpdateGrant(marker, identity, key, now), false);
  }
  assert.equal(verifyPasswordUpdateGrant(grant, identity, key, now + 900_000), false);
  assert.equal(verifyPasswordUpdateGrant(grant, identity, "", now), false);
  assert.equal(createPasswordUpdateGrant(identity, "", now), null);
});
