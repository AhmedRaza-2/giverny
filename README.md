<p align="center"><img src="favicon.svg" width="56" alt=""></p>

<h1 align="center">Giverny</h1>
<p align="center"><b>Give Claude taste.</b><br>Every design and frontend skill for Claude Code, checked and in one place.<br>Copy a prompt, paste it into Claude, and the skill installs itself.</p>

<p align="center"><a href="https://giverny-two.vercel.app/">Open Giverny</a> · <a href="CONTRIBUTING.md">Add a skill</a></p>

---

## What's inside

10,000+ public skills for Claude Code from 300+ GitHub repos, in five sections:

| Section | Examples |
|---|---|
| Design | Frontend Design, Impeccable, Taste Skill, UI UX Pro Max, Emil Kowalski, Open Design |
| Video & media | HyperFrames, Remotion, OpenMontage, ElevenLabs, fal.ai, FFmpeg, Blender |
| Coding | Superpowers, Matt Pocock, gstack, Trail of Bits, Stripe, Supabase, Sentry, Cloudflare |
| Marketing | Corey Haines, Claude SEO, GEO SEO, advertising, email, social |
| Productivity | Office documents, product management, research, notes, business |

## How the catalog works

```
data/sources.json ──► scripts/index-skills.mjs ──► api/_index.js ─┐
 (repos to read)      (reads every SKILL.md)       (auto index)    ├─► api/_skills.js ─► /api/search  (results, no commands)
                                                    api/_featured.js ┘                  ─► /api/reveal  (commands, after GitHub check)
                                                    (hand-written picks)
```

- **Indexer.** For every repo in `data/sources.json` it downloads only the `SKILL.md` files (sparse, shallow clone), reads each skill's name and description, files it into a section and category using `data/taxonomy.json`, and writes the install command (`npx skills add owner/repo --skill name`, plus the Claude Code plugin route when the repo has a marketplace).
- **Updates.** Each skill keeps the git hash of its `SKILL.md`. When an author changes it, the hash changes and the skill shows **Updated**. New skills show **New**, and deleted ones drop out. `data/changes.json` lists what changed in the last run.
- **Discovery.** `scripts/discover.mjs` searches GitHub for popular skill repos not yet listed and writes them to `data/candidates.json` for review.
- **Weekly.** `.github/workflows/update-index.yml` runs all of this every Monday and commits the result, and Vercel redeploys.
- **Search.** `/api/search` builds an index once per server instance and answers in a few milliseconds. It maps intent to skills ("optimize my app" → performance, Core Web Vitals, profiling) using the `intents` in `data/taxonomy.json`, then ranks by match, coverage, popularity and editorial picks.

Add a source: put `{ "repo": "owner/name", "section": "coding" }` in `data/sources.json` (or `"section": "auto", "fallback": "coding"` for mixed collections), then run:

```bash
node scripts/index-skills.mjs && node scripts/build-public.mjs
```

## How a copied prompt works

Each **Copy prompt** button gives Claude Code everything it needs:

1. The exact install command (`npx skills add …`, `claude plugin install …`, or the author's own CLI), made non-interactive.
2. A fallback route (Claude Code plugin or manual copy into `~/.claude/skills/`).
3. An example request to try once it's installed.

## Run it locally

No build step. The dev server runs the API the same way Vercel does:

```bash
GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... SESSION_SECRET=... node scripts/dev.mjs 3000
```

For local sign-in, make a second OAuth app with callback `http://localhost:3000/api/auth/callback`.

## Deploy

Vercel: import the repo with framework preset **Other**, no build command, and `./` as the output directory. Then do the one-time setup under Unlocking.

## Analytics

See [ANALYTICS.md](ANALYTICS.md) for visits, clicks and copies.

## Unlocking (strict)

Every skill is locked until a visitor signs in with GitHub, follows the owner and stars the repo.

- **Real identity.** Visitors sign in with GitHub OAuth (no scopes, public profile only), so nobody can claim someone else's username.
- **Checked on every copy.** `/api/reveal` asks GitHub live, each time, whether the signed-in user stars the repo and follows the owner. Un-star or un-follow and the next copy is refused.
- **Nothing to copy in the page.** Install commands and prompts live only on the server (`api/`). Search results carry names and descriptions only.
- **Sessions** are AES-256-GCM encrypted, HttpOnly, SameSite=Lax cookies. Sign-in uses a CSRF state check and refuses open redirects.

### One-time setup (Vercel)

1. **Create a GitHub OAuth app** at https://github.com/settings/applications/new
   - Application name: `Giverny`
   - Homepage URL: `https://giverny-two.vercel.app`
   - Authorization callback URL: `https://giverny-two.vercel.app/api/auth/callback`
   - Click **Register application**, copy the **Client ID**, then **Generate a new client secret** and copy it.
2. **Add environment variables** in Vercel (Project, then Settings, then Environment Variables):

   | Name | Value |
   |---|---|
   | `GITHUB_CLIENT_ID` | the Client ID |
   | `GITHUB_CLIENT_SECRET` | the client secret |
   | `SESSION_SECRET` | any random string, 32+ characters (e.g. `openssl rand -base64 48`) |
   | `GIVERNY_OWNER` | optional, defaults to `AhmedRaza-2` |
   | `GIVERNY_REPO` | optional, defaults to `AhmedRaza-2/giverny` |
   | `GIVERNY_REQUIRE_FOLLOW` | optional, set to `false` to require the star only |

3. **Redeploy** (Deployments, then the latest one, then Redeploy).

Until these are set, the site loads and browses fine, but copying says sign-in isn't set up. GitHub Pages can't run the API, so use the Vercel deployment.

### Editing skills

Hand-written picks live in `api/_featured.js`; everything else comes from the indexer. Run `node scripts/test-gate.mjs` to test search and the whole unlock flow against a fake GitHub.

The original skill repos are public, and so is this repo's source. The gate controls Giverny's one-click copy, not the open-source skills themselves.

## Settings

[`assets/config.js`](assets/config.js) holds the owner and repo used for the links on the page, plus the analytics settings.

## Not affiliated with Anthropic

Giverny is an independent, community index. "Claude" is a trademark of Anthropic. Each skill belongs to its author under its own license.

The name comes from Giverny, the garden where the other Claude, Claude Monet, painted his water lilies.

## License

The site code is MIT. See [LICENSE](LICENSE).
