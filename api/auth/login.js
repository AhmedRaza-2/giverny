import crypto from "node:crypto";
import { CONF, isConfigured, query, origin, setState, redirect, json, safeReturn, seal } from "../_lib.js";

// Starts "Sign in with GitHub". No OAuth scopes: we only read public profile, follows and stars.
export default function handler(req, res) {
  if (!isConfigured()) return json(res, 503, { error: "not_configured" });
  const nonce = crypto.randomBytes(16).toString("base64url");
  const ret = safeReturn(query(req).get("return") || "/");
  setState(req, res, seal({ nonce, ret, t: Date.now() }));
  const u = new URL(CONF.web + "/login/oauth/authorize");
  u.searchParams.set("client_id", CONF.clientId);
  u.searchParams.set("redirect_uri", origin(req) + "/api/auth/callback");
  u.searchParams.set("state", nonce);
  u.searchParams.set("allow_signup", "true");
  redirect(res, u.toString());
}
