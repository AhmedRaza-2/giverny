#!/usr/bin/env node
// Prepares generated files after the catalog changes:
//  - api/_taxonomy.js: the taxonomy as a JS module for the server (bundles reliably on Vercel).
// The browser never receives the catalog: it asks /api/search for one page of results at a time,
// and install commands only come from /api/reveal after the GitHub check.
import { writeFile, rm, readFile } from "node:fs/promises";
import { SKILLS } from "../api/_skills.js";

const tax = await readFile(new URL("../data/taxonomy.json", import.meta.url), "utf8");
await writeFile(new URL("../api/_taxonomy.js", import.meta.url), `// Generated from data/taxonomy.json by scripts/build-public.mjs. Edit the JSON, not this file.\nexport const TAX = ${tax.trim()};\n`);
for (const old of ["../data/skills.js", "../data/skills.json"]) await rm(new URL(old, import.meta.url), { force: true });
console.log(`api/_taxonomy.js written. Catalog: ${SKILLS.length} skills (served by /api/search).`);
