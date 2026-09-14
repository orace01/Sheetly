import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });

  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toContain("hunter2");
  });

  it("salts each hash independently, so the same password hashes differently each time", async () => {
    const a = await hashPassword("same password");
    const b = await hashPassword("same password");
    expect(a).not.toBe(b);
    await expect(verifyPassword("same password", a)).resolves.toBe(true);
    await expect(verifyPassword("same password", b)).resolves.toBe(true);
  });
});
