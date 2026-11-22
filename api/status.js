import { getSession, clearSession, checkAccess, publicStatus, json, GitHubError } from "./_lib.js";

// Who is signed in, and do they star + follow right now? Checked live on every call.
export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return json(res, 200, publicStatus(null, null));
  try {
    return json(res, 200, publicStatus(session, await checkAccess(session)));
  } catch (e) {
    if (e instanceof GitHubError && e.code === "auth") { clearSession(req, res); return json(res, 200, publicStatus(null, null)); }
    return json(res, 502, { ...publicStatus(session, null), error: e.code || "github" });
  }
}
