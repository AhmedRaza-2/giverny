import { search } from "./_search.js";
import { query, json } from "./_lib.js";

// Public search: no personal data, so responses can be cached at the edge for a few minutes.
export default function handler(req, res) {
  const q = query(req);
  const int = (v, d, max) => Math.max(0, Math.min(max, parseInt(v, 10) || d));
  const body = search({
    q: (q.get("q") || "").slice(0, 200),
    section: q.get("section") || "all",
    cat: q.get("cat") || "all",
    offset: int(q.get("offset"), 0, 100000),
    limit: int(q.get("limit"), 40, 100) || 40
  });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=600, stale-while-revalidate=86400");
  res.end(JSON.stringify(body));
}
