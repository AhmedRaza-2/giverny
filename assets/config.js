/*
 * Giverny settings. This is the only file you need to edit to launch.
 */
window.GIVERNY_CONFIG = {
  // Your GitHub username. Visitors follow this account to unlock.
  owner: "AhmedRaza-2",

  // The repository visitors star to unlock (owner/name).
  repo: "AhmedRaza-2/giverny",

  // Public URL added to copied prompts. Leave empty to use whatever domain the page is served from
  // (works on GitHub Pages, Vercel, or a custom domain without changes).
  siteUrl: "",

  // Everything is free until this date (YYYY-MM-DD, visitor's local time).
  // After it, copying needs a follow + star. Set to "2000-01-01" to gate right away,
  // or "2999-01-01" to keep it free forever.
  freeUntil: "2027-01-01",

  // While the gate is on, this many skills (from the top of the list) stay free to copy.
  freePreview: 6,

  // Re-check a verified visitor's follow and star after this many days.
  recheckDays: 7,

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
