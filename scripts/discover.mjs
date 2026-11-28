#!/usr/bin/env node
// Finds popular GitHub repos that publish Claude / agent skills but aren't in data/sources.json yet.
// Writes data/candidates.json for a human to review; copy good ones into sources.json.
// Needs the GitHub CLI (gh). Usage: node scripts/discover.mjs [--min 300]
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";

const run = promisify(execFile);
const args = process.argv.slice(2);
const MIN = Number(args[args.indexOf("--min") + 1]) || 300;
const root = new URL("..", import.meta.url);
const { sources } = JSON.parse(await readFile(new URL("data/sources.json", root), "utf8"));
const known = new Set(sources.map(s => s.repo.toLowerCase()));
const queries = [
  "topic:claude-skills", "topic:agent-skills", "topic:claude-code-skills", "topic:claude-skill", "topic:claude-code-plugin",
  "topic:skill-md", "claude skills in:name,description", "agent skills in:name,description", "SKILL.md in:readme claude"
];
const LISTS = /awesome|curated list|collection of links/i;
const found = new Map();
for (const q of queries) {
  try {
    const { stdout } = await run("gh", ["api", "-X", "GET", "search/repositories", "-f", `q=${q} stars:>=${MIN}`, "-f", "sort=stars", "-f", "per_page=100",
      "--jq", ".items[] | [.full_name, .stargazers_count, .pushed_at, (.description // \"\")] | @tsv"], { maxBuffer: 1 << 24 });
    for (const line of stdout.trim().split("\n").filter(Boolean)) {
      const [repo, stars, pushed, desc] = line.split("\t");
      if (known.has(repo.toLowerCase()) || LISTS.test(repo + " " + desc)) continue;
      found.set(repo, { repo, stars: +stars, pushed: pushed.slice(0, 10), description: desc.slice(0, 160), query: q });
    }
  } catch (e) { console.warn(`query failed: ${q}`); }
}
const candidates = [...found.values()].sort((a, b) => b.stars - a.stars);
await writeFile(new URL("data/candidates.json", root), JSON.stringify({ date: new Date().toISOString().slice(0, 10), minStars: MIN, candidates }, null, 1) + "\n");
console.log(`${candidates.length} new candidate repos (≥${MIN} stars) written to data/candidates.json`);
