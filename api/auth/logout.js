import { clearSession, redirect, origin } from "../_lib.js";

export default function handler(req, res) {
  clearSession(req, res);
  redirect(res, origin(req) + "/");
}
