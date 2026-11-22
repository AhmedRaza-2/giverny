<p align="center"><img src="favicon.svg" width="56" alt=""></p>

<h1 align="center">Giverny</h1>
<p align="center"><b>Give Claude taste.</b><br>Every design and frontend skill for Claude Code, checked and in one place.<br>Copy a prompt, paste it into Claude, and the skill installs itself.</p>

<p align="center"><a href="https://giverny-two.vercel.app/">Open Giverny</a> · <a href="CONTRIBUTING.md">Add a skill</a></p>

---

## What's inside

54 skills from 39 makers, including Anthropic, Vercel, Google Labs, Figma, Expo, GreenSock, Remotion, Paul Bakaus, Emil Kowalski and Addy Osmani, grouped into:

| Category | Examples |
|---|---|
| Taste & direction | Frontend Design, UI UX Pro Max, Taste Skill, Impeccable, UI Skills |
| Design systems | Awesome DESIGN.md, DESIGN.md Writer, Designer Skills, Theme Factory |
| Motion & feel | Emil Kowalski's Skills, GSAP, Make Interfaces Feel Better |
| Review & accessibility | Web Design Guidelines, Web Quality Skills, Playwright Skill, Color Expert |
| Frameworks & platforms | React Best Practices, shadcn/ui, Three.js, Expo, SwiftUI Pro |
| Slides, diagrams & media | Frontend Slides, Visual Explainer, Remotion, Excalidraw |
| Design tool bridges | Figma, Stitch, Canva, Mobbin, Adobe |

Every install command comes from the skill's own README or plugin manifest. Star counts refresh every Monday through a GitHub Action.

## How a copied prompt works

Each **Copy prompt** button gives Claude Code everything it needs:

1. The exact install command (`npx skills add …`, `claude plugin install …`, or the author's own CLI), made non-interactive.
2. A fallback route (Claude Code plugin or manual copy into `~/.claude/skills/`).
3. An example request to try once it's installed.

## Run it locally

It's a static site with no build step.

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root. The site appears at `https://<you>.github.io/giverny/`.

Vercel, Netlify and Cloudflare Pages also work: import the repo with no build command and `/` as the output directory.

## Analytics

See [ANALYTICS.md](ANALYTICS.md) for visits, clicks and copies.

## Settings

Everything lives in [`assets/config.js`](assets/config.js):

| Setting | What it does |
|---|---|
| `owner` | GitHub account visitors follow to unlock |
| `repo` | Repository visitors star to unlock |
| `siteUrl` | Link added to the end of copied prompts |
| `freeUntil` | Everything is free until this date, then the follow + star step starts |
| `freePreview` | How many skills stay free to copy once it starts |
| `recheckDays` | How often a verified visitor's follow and star are re-checked |

Add `?gate=preview` to the URL to see the locked experience before `freeUntil`.

### How unlocking works

The visitor enters their GitHub username, follows, stars, and returns to the tab. The page checks GitHub's public API (`/users/{user}/following/{owner}` and the visitor's newest stars) and unlocks in that browser. It re-checks every few days, so removing the star or the follow pauses access.

It runs entirely in the browser with no server or login, so it's a growth nudge, not DRM: someone determined can type another person's username. To make it strict, add GitHub OAuth through a small serverless function.

## Not affiliated with Anthropic

Giverny is an independent, community index. "Claude" is a trademark of Anthropic. Each skill belongs to its author under its own license.

The name comes from Giverny, the garden where the other Claude, Claude Monet, painted his water lilies.

## License

The site code is MIT. See [LICENSE](LICENSE).
