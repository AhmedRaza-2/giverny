# Adding skills to Giverny

Giverny indexes public GitHub repos that contain `SKILL.md` files. You don't add skills one by one; you add the repo, and every skill in it is picked up and kept up to date.

## Suggest a repo

Open an issue with the repo link, or send a pull request that adds it to [`data/sources.json`](data/sources.json):

```json
{ "repo": "owner/name", "section": "coding" }
```

`section` is one of `design`, `media`, `coding`, `marketing`, `productivity`. For a collection that spans several, use `"section": "auto", "fallback": "coding"` and each skill is filed by its description.

Before opening the PR, check it indexes cleanly:

```bash
node scripts/index-skills.mjs --only owner/name && node scripts/build-public.mjs
```

## What gets accepted

- Public repos whose skills are meant for people to install, not a product's internal tooling.
- Each skill has a `SKILL.md` with a `name` and a `description` that says what it does.
- Original work, not a copy or translation of a repo that's already listed.
- Nothing designed to harm people or systems you don't own.

## Featured picks

`api/_featured.js` holds hand-written entries with verified install commands. They rank first. Propose one in a PR with the install command you tested.

## Search tuning

If a search returns the wrong skills, add words to the matching category's `kw` list or to `intents` in [`data/taxonomy.json`](data/taxonomy.json), and include the query in your PR description.
