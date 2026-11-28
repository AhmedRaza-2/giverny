import { getSession, clearSession, checkAccess, findSkill, reveal, origin, isConfigured, publicStatus, json, query, GitHubError } from "./_lib.js";

// The only place install prompts and commands come from. Every call re-checks the star and follow with GitHub.
export default async function handler(req, res) {
  if (!isConfigured()) return json(res, 503, { error: "not_configured" });
  const skill = await findSkill(query(req).get("id") || "");
  if (!skill) return json(res, 404, { error: "unknown_skill" });
  const session = getSession(req);
  if (!session) return json(res, 401, { error: "signin", ...publicStatus(null, null) });
  let access;
  try { access = await checkAccess(session); }
  catch (e) {
    if (e instanceof GitHubError && e.code === "auth") { clearSession(req, res); return json(res, 401, { error: "signin", ...publicStatus(null, null) }); }
    return json(res, 502, { error: e.code || "github" });
  }
  if (!access.unlocked) return json(res, 403, { error: "locked", ...publicStatus(session, access) });
  return json(res, 200, { ...reveal(skill, origin(req)), ...publicStatus(session, access) });
}
