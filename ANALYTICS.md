# Giverny analytics

Use three free tools together. Each answers a different question.

| Question | Where to look | Cost |
|---|---|---|
| How many people visited? From which country, device, Instagram or LinkedIn? | Vercel Web Analytics | Free (Hobby) |
| What did they click, copy and search? Which skill is most popular? Where do people drop off? | PostHog | Free up to 1M events a month |
| Who exactly followed you and starred the repo? | GitHub | Free |

## 1. Vercel Web Analytics (visits)

1. Open your project on vercel.com and go to the **Analytics** tab.
2. Click **Enable**.
3. Redeploy once: Deployments, then the latest one, then **Redeploy**.

The site already loads the script (`analytics.vercel: true` in `assets/config.js`). Within a few minutes you'll see visitors, page views, top referrers (instagram.com, linkedin.com), countries, browsers and devices.

Vercel's custom events (clicks, copies) need a paid plan. That's why PostHog handles events below.

## 2. PostHog (clicks, copies, searches)

1. Sign up free at posthog.com. Pick the US or EU region.
2. Create a project. In **Project settings**, copy the **Project API key** (starts with `phc_`).
3. Paste it into `assets/config.js`:

   ```js
   posthogKey: "phc_your_key_here",
   posthogHost: "https://us.i.posthog.com",   // or https://eu.i.posthog.com
   ```

4. Commit and push. Vercel redeploys on its own.

The key is public by design (it can only send events, not read them), so committing it is safe.

### Events Giverny sends

| Event | When | Properties |
|---|---|---|
| `$pageview` | Every visit (automatic) | referrer, UTM tags, country, device |
| `copy_prompt` | Someone copies an install prompt | `skill`, `category`, `searched` |
| `copy_command` | Someone copies a raw command | `skill`, `kind` (cmd, slash, alt) |
| `skill_open` | A skill row is expanded | `skill`, `category` |
| `search` | A search settles for a second | `query`, `results` |
| `filter` | A category chip is clicked | `category` |
| `locked_click` | Someone clicks a locked skill | `skill` |
| `gate_open` | The unlock dialog opens | `skill`, `gate_on` |
| `unlock_check` | The follow and star check runs | `following`, `starred`, `auto` |
| `unlocked` | A visitor unlocks everything | `gate_on` |
| `unlock_error` | The check fails | `reason` |
| `github_click` | Any GitHub link is clicked | `target`, `skill` |

GitHub usernames are never sent. Visitors stay anonymous.

### Useful views to build in PostHog

- **Top skills:** Insights, then Trends, event `copy_prompt`, breakdown by `skill`.
- **Launch traffic:** Web analytics tab, then filter by UTM source (`instagram`, `linkedin`).
- **Unlock funnel:** Insights, then Funnels: `$pageview`, then `gate_open`, then `unlock_check`, then `unlocked`.
- **What people want but can't find:** Trends on `search` broken down by `query`, filtered to `results = 0`. This is your list of skills to add next.

## 3. GitHub (who followed and starred)

- Stargazers: `https://github.com/AhmedRaza-2/giverny/stargazers`
- Followers: `https://github.com/AhmedRaza-2?tab=followers`
- Repo traffic: the repo's **Insights** tab, then **Traffic** (views, clones and referring sites for the last 14 days).

## Tag your launch links

Add UTM tags so every dashboard shows which post brought people:

- Instagram: `https://giverny-two.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=v1_launch`
- LinkedIn: `https://giverny-two.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=v1_launch`

## Testing

Set `debug: true` in `assets/config.js` to print every event in the browser console. Nothing is sent from `localhost`.
