/*
 * Giverny settings. This is the only file you need to edit to launch.
 */
window.GIVERNY_CONFIG = {
  // Your GitHub username. Visitors follow this account to unlock.
  owner: "AhmedRaza-2",

  // The repository visitors star to unlock (owner/name).
  repo: "AhmedRaza-2/giverny",

  // Unlocking is enforced on the server (api/), which checks GitHub on every copy.
  // The owner and repo it checks are set there too (GIVERNY_OWNER / GIVERNY_REPO env vars on Vercel).

  // Stats. See ANALYTICS.md for the two-minute setup.
  analytics: {
    // Vercel Web Analytics: visits, countries, referrers, devices. Also switch it on in the Vercel dashboard.
    vercel: true,
    // PostHog project API key (starts with "phc_"). Unlocks click, copy, search and unlock tracking.
    // It is a public key, safe to commit.
    posthogKey: "",
    // "https://us.i.posthog.com" or "https://eu.i.posthog.com", matching your PostHog region.
    posthogHost: "https://us.i.posthog.com",
    // Log every event to the browser console, for testing.
    debug: false
  }
};
