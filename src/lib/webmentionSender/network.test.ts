import { afterEach, describe, expect, test, vi } from "vitest"
import { isIpAllowed, safeRequest } from "./network"

describe("IP safety and SSRF prevention", () => {
  test.each(["127.0.0.1", "10.0.0.1", "192.168.1.1", "172.16.0.1", "169.254.169.254", "0.0.0.0", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1"])("rejects reserved or private IP %s", ip => {
    expect(isIpAllowed(ip)).toBe(false)
  })

  test.each(["8.8.8.8", "1.1.1.1", "2607:f8b0:4004:c07::64"])("allows public IP %s", ip => {
    expect(isIpAllowed(ip)).toBe(true)
  })

  test("rejects credentials, non-http protocols and nonstandard ports", async () => {
    await expect(safeRequest("ftp://example.com/file")).rejects.toThrow()
    await expect(safeRequest("https://user:pass@example.com/")).rejects.toThrow()
    await expect(safeRequest("https://example.com:8443/")).rejects.toThrow()
  })
})
