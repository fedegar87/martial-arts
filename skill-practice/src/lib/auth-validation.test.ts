import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedNextPath,
  validateEmail,
  validatePasswordMatch,
  validatePasswordStrength,
} from "./auth-validation.ts";

test("validatePasswordStrength: accepts 8 chars", () => {
  assert.deepEqual(validatePasswordStrength("12345678"), { valid: true });
});

test("validatePasswordStrength: accepts more than 8 chars", () => {
  assert.deepEqual(validatePasswordStrength("password-lunga"), { valid: true });
});

test("validatePasswordStrength: rejects 7 chars", () => {
  const result = validatePasswordStrength("1234567");
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /almeno 8/i);
});

test("validatePasswordStrength: rejects empty password", () => {
  const result = validatePasswordStrength("");
  assert.equal(result.valid, false);
});

test("validatePasswordStrength: rejects more than 72 chars", () => {
  const result = validatePasswordStrength("a".repeat(73));
  assert.equal(result.valid, false);
  assert.match(result.error ?? "", /72/);
});

test("validatePasswordStrength: accepts unicode chars", () => {
  assert.deepEqual(validatePasswordStrength("àbcdèfgh"), { valid: true });
});

test("validatePasswordMatch: accepts identical passwords", () => {
  assert.deepEqual(validatePasswordMatch("12345678", "12345678"), {
    valid: true,
  });
});

test("validatePasswordMatch: rejects different passwords", () => {
  const result = validatePasswordMatch("12345678", "different");
  assert.equal(result.valid, false);
});

test("validatePasswordMatch: is case-sensitive", () => {
  const result = validatePasswordMatch("Password", "password");
  assert.equal(result.valid, false);
});

test("validateEmail: accepts valid email", () => {
  assert.deepEqual(validateEmail("user@example.com"), { valid: true });
});

test("validateEmail: accepts email with plus", () => {
  assert.deepEqual(validateEmail("foo+bar@example.com"), { valid: true });
});

test("validateEmail: rejects missing at sign", () => {
  const result = validateEmail("invalid");
  assert.equal(result.valid, false);
});

test("validateEmail: rejects empty email", () => {
  const result = validateEmail("");
  assert.equal(result.valid, false);
});

test("validateEmail: trims whitespace", () => {
  assert.deepEqual(validateEmail("  user@example.com  "), { valid: true });
});

test("isAllowedNextPath: null returns /hub", () => {
  assert.equal(isAllowedNextPath(null), "/hub");
});

test("isAllowedNextPath: unknown path returns /hub", () => {
  assert.equal(isAllowedNextPath("/admin"), "/hub");
});

test("isAllowedNextPath: external URL returns /hub", () => {
  assert.equal(isAllowedNextPath("https://evil.example"), "/hub");
});

test("isAllowedNextPath: /auth/update-password is allowed", () => {
  assert.equal(isAllowedNextPath("/auth/update-password"), "/auth/update-password");
});

test("isAllowedNextPath: /onboarding is allowed", () => {
  assert.equal(isAllowedNextPath("/onboarding"), "/onboarding");
});

test("isAllowedNextPath: /hub is allowed", () => {
  assert.equal(isAllowedNextPath("/hub"), "/hub");
});
