/*
 * Giverny analytics. Sends page views and named events to whichever services are switched on
 * in assets/config.js. With nothing configured, every call is a no-op.
 *
 *   window.giverny.track("copy_prompt", { skill: "impeccable" })
 *
 * Never send personal data (no GitHub usernames, no emails) through track().
 */
(() => {
  "use strict";
  const A = (window.GIVERNY_CONFIG && window.GIVERNY_CONFIG.analytics) || {};
  const host = location.hostname;
  const isLocal = !/^https?:$/.test(location.protocol) || host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  const queue = [];
  let ph = null;

  // Vercel Web Analytics: visitors, page views, referrers, countries, devices.
  // The script is loaded directly in index.html. Turn it on in the Vercel dashboard (Project, then Analytics, then Enable).
  // Not served on GitHub Pages. The script tag in index.html will only load on Vercel deployments.

  // PostHog: every click, copy, search and unlock, with funnels and dashboards. Free up to 1M events a month.
  if (A.posthogKey && !isLocal) {
    const api = (A.posthogHost || "https://us.i.posthog.com").replace(/\/$/, "");
    const assets = api.replace(".i.posthog.com", "-assets.i.posthog.com");
    const s = document.createElement("script");
    s.async = true; s.src = assets + "/static/array.js";
    s.onload = () => {
      if (!window.posthog || !window.posthog.init) return;
      window.posthog.init(A.posthogKey, {
        api_host: api,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        persistence: "localStorage+cookie"
      });
      ph = window.posthog;
      queue.splice(0).forEach(([n, p]) => ph.capture(n, p));
    };
    document.head.appendChild(s);
  }

  function track(name, props) {
    const data = props || {};
    try {
      if (window.va) window.va("event", { name, data });
      if (ph) ph.capture(name, data);
      else if (A.posthogKey && !isLocal && queue.length < 50) queue.push([name, data]);
      if (A.debug) console.info("[giverny]", name, data);
    } catch { /* analytics must never break the page */ }
  }

  window.giverny = Object.assign(window.giverny || {}, { track });
})();
