# Giverny v1.0 launch kit

Files in this folder:

| File | Use it for |
|---|---|
| `slide-1.png` … `slide-6.png` | Instagram carousel (1080×1350, post in order) |
| `giverny-carousel-linkedin.pdf` | LinkedIn "document" post (the same 6 slides, swipeable) |
| `story.png` | Instagram story (1080×1920). Put the link sticker in the empty space under the screenshot |
| `carousel.html` | Source for the slides. Edit the text and re-render if you want changes |

Tagged links (so analytics shows which post brought each visitor):

- Instagram: `https://giverny-two.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=v1_launch`
- LinkedIn: `https://giverny-two.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=v1_launch`

---

## LinkedIn post

Attach `giverny-carousel-linkedin.pdf` as a document. Title it: **Give Claude taste: 54 design skills, free**

> Claude can build a full website in 10 minutes.
> It still looks like every other AI website.
>
> The fix isn't a longer prompt. It's skills.
>
> Skills are small instruction packs that Claude Code loads by itself when your task matches. Anthropic, Vercel, Google, Figma and some of the best designers online have published dozens of them for UI and UX work.
>
> The problem: they were scattered across 40+ GitHub repos, each with a different install command.
>
> So I put all of them on one page.
>
> How it works:
> 1. Pick a skill (start with Frontend Design or Impeccable)
> 2. Click "Copy prompt"
> 3. Paste it into Claude Code. It installs the skill and shows you how to use it.
>
> 54 skills. Free: sign in with GitHub and star the repo to unlock. Many more coming very soon.
>
> Link in the first comment.
>
> Try one on your next landing page and send me the before and after. I'll share the best ones.
>
> #ClaudeCode #UIUX #WebDesign #Frontend #AI

**First comment (post it right after publishing):**

> Here it is: https://giverny-two.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=v1_launch
>
> If a skill you use isn't listed, reply with the link and I'll add it.

---

## Instagram carousel caption

Upload `slide-1.png` to `slide-6.png` in order.

> Your AI-built website looks like everyone else's. Here's the fix 👇
>
> Claude Code can load "skills": instruction packs that teach it real design taste. Anthropic, Vercel, Google and top designers have made dozens. Most people have never installed one.
>
> I put 54 of them on one page. Pick one, copy the prompt, paste it into Claude. Done.
>
> Free. Version 1.0. Many more skills coming very soon.
>
> 🔗 Link in bio
>
> Save this for your next build, and send it to the friend who keeps shipping purple gradients.
>
> #claudecode #claudeai #uiux #webdesign #uidesign #frontend #webdeveloper #vibecoding #aitools #designtools

**Before posting:** set your Instagram bio link to the Instagram tagged link above.

## Instagram story

Post `story.png`. Add a **Link** sticker in the empty space under the screenshot, pointing to the Instagram tagged link. Sticker text: `Try it free`.

Optional second story: a 10-second screen recording of you clicking "Copy prompt", pasting into Claude Code, and the skill installing.

---

## Replies for common comments

- **"What's a skill?"** A folder with instructions Claude Code reads when your request matches, like a specialist it can call in. You install it once and it works in every project.
- **"Does it work with Cursor / Codex?"** Most use the open Agent Skills format, so `npx skills add` installs them for Cursor, Codex and others too. The copy button is tuned for Claude Code.
- **"Is it free?"** Yes. Sign in with GitHub, follow and star the repo, and every skill unlocks. Each skill belongs to its author and is open source.
- **"You missed X"** Send me the link. It'll be in the next update.

## Next 7 days

1. **Day 2:** Before and after. Build the same landing page with and without Frontend Design or Impeccable and post both screenshots side by side.
2. **Day 4:** Your favourite skill in 30 seconds, as a screen recording.
3. **Day 7:** "What people copied most this week." Take the top 5 from your PostHog `copy_prompt` chart. It's real data, and it brings people back.

## Launch-day checklist

- [ ] Vercel Analytics enabled (see `ANALYTICS.md`)
- [ ] PostHog key added to `assets/config.js` and pushed
- [ ] Open the site on your phone and copy one prompt to check it works
- [ ] Instagram bio link set to the tagged link
- [ ] LinkedIn post published, with the link in the first comment within a minute
- [ ] Reply to every comment in the first 2 hours

---

## Launch video (Reel / LinkedIn video)

File: `giverny-launch.mp4` (33 s, 1080×1920, with music and sound effects). Cover: `giverny-launch-cover.png`.

**Instagram Reel caption**

> Your AI-built app looks like everyone else's. Here's the fix 👇
>
> 10,000+ Claude skills, one search. Type what you want ("edit a video", "optimize my app"), copy one prompt, and Claude installs the skill.
>
> Free. 🔗 Link in bio
>
> #claudecode #claudeai #aitools #webdesign #vibecoding #buildinpublic

**LinkedIn video post**

> Claude Code can do far more than most people use it for. It just needs the right skills.
>
> There are 10,000+ of them on GitHub, scattered across 300+ repos with no search. So I built one: say what you want to do and get the best skills for it, ready to install with one prompt.
>
> 33 seconds on how it works 👇 Link in the first comment.
>
> #ClaudeCode #AI #DeveloperTools #BuildInPublic

Tip: on Instagram, add a trending sound at low volume under the built-in music, or swap it entirely; trending audio helps Reels reach.
