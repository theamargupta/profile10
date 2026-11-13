// ADMIN-311: the profile row still stores an i.ibb.co avatar URL; that host
// times out and fails the /about console-error E2E. Serve the same image from
// /public instead. Other URLs pass through unchanged.
export const LOCAL_AVATAR = "/amar-avatar.png";

export function resolveAvatarSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (new URL(url).hostname === "i.ibb.co") return LOCAL_AVATAR;
  } catch {
    // relative path such as "/amar-avatar.png": not an absolute URL, keep it.
  }
  return url;
}
