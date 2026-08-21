import { describe, expect, it, vi, afterEach } from "vitest";
import { getApiBaseUrl } from "./env";

describe("getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the configured NEXT_PUBLIC_API_BASE_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://moi.bytechnum.com");
    expect(getApiBaseUrl()).toBe("https://moi.bytechnum.com");
  });

  it("falls back to the local Laravel dev server when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(getApiBaseUrl()).toBe("http://localhost:8000");
  });
});
