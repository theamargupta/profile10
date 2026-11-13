import { describe, it, expect } from "vitest";
import { resolveAvatarSrc, LOCAL_AVATAR } from "./avatar-src";

// ADMIN-311: /about loaded the avatar from i.ibb.co, which times out.
describe("resolveAvatarSrc", () => {
  it("maps an i.ibb.co URL to the self-hosted file", () => {
    expect(resolveAvatarSrc("https://i.ibb.co/cXpccm8Z/x.png")).toBe(LOCAL_AVATAR);
  });
  it("keeps other hosts and local paths unchanged", () => {
    expect(resolveAvatarSrc("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    expect(resolveAvatarSrc("/amar-avatar.png")).toBe("/amar-avatar.png");
  });
  it("returns null for empty or invalid input", () => {
    expect(resolveAvatarSrc(null)).toBeNull();
    expect(resolveAvatarSrc("")).toBeNull();
  });
});
