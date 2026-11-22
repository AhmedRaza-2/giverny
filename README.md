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
- **Nothing to copy in the page.** Install commands and prompts live only in `api/_skills.js` on the server. The browser gets names and descriptions (`data/skills.js`, generated) until the check passes.
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

Edit `api/_skills.js`, then run `node scripts/build-public.mjs` to regenerate the public `data/skills.js`. Run `node scripts/test-gate.mjs` to test the whole unlock flow against a fake GitHub.

The original skill repos are public, and so is this repo's source. The gate controls Giverny's one-click copy, not the open-source skills themselves.

## Settings

[`assets/config.js`](assets/config.js) holds the owner and repo used for the links on the page, plus the analytics settings.

## Not affiliated with Anthropic

Giverny is an independent, community index. "Claude" is a trademark of Anthropic. Each skill belongs to its author under its own license.

The name comes from Giverny, the garden where the other Claude, Claude Monet, painted his water lilies.

## License

The site code is MIT. See [LICENSE](LICENSE).
