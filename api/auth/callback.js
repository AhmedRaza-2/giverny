import { CONF, isConfigured, query, origin, getState, clearState, unseal, setSession, redirect, json, gh } from "../_lib.js";

// GitHub sends the visitor back here. Swap the code for a token, read who they are, set an encrypted session cookie.
export default async function handler(req, res) {
  if (!isConfigured()) return json(res, 503, { error: "not_configured" });
  const q = query(req);
  const state = unseal(getState(req) || "");
  clearState(req, res);
  const back = (path, flag) => redirect(res, `${origin(req)}${path}${path.includes("?") ? "&" : "?"}signin=${flag}`);
  if (q.get("error")) return back(state?.ret || "/", "cancelled");
  if (!state || state.nonce !== q.get("state") || Date.now() - state.t > 600000 || !q.get("code")) return back("/", "expired");
  try {
    const t = await fetch(CONF.web + "/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "giverny" },
      body: JSON.stringify({ client_id: CONF.clientId, client_secret: CONF.clientSecret, code: q.get("code"), redirect_uri: origin(req) + "/api/auth/callback" })
    });
    const tok = await t.json();
    if (!tok.access_token) return back(state.ret, "failed");
    const u = await gh(tok.access_token, "/user");
    if (!u.ok) return back(state.ret, "failed");
    const me = await u.json();
    setSession(req, res, { login: me.login, token: tok.access_token });
    return back(state.ret, "ok");
  } catch {
    return back(state.ret, "failed");
  }
}
