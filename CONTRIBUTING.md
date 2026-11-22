# Adding a skill

Giverny lists skills that make Claude better at design or frontend work. To suggest one, open an issue with the repo link, or send a pull request.

## Pull request

Add an entry to [`data/skills.js`](data/skills.js) inside the right category block:

```js
{
  "id": "my-skill",                       // unique, lowercase, dashes
  "name": "My Skill",
  "by": "Your Name",                      // the person or org people know
  "repo": "owner/repo",
  "path": "skills/my-skill",              // optional: folder of the SKILL.md
  "cat": "taste",                         // taste | systems | motion | review | platforms | visual | tools
  "official": false,                      // true only if made by the company behind the tool
  "desc": "One or two plain sentences on what it makes Claude do.",
  "cmd": "npx skills add owner/repo --skill my-skill",
  "plugin": { "add": "owner/repo", "install": "my-skill@my-marketplace" }, // optional
  "ask": "An example request to try after installing.",
  "stars": 0                              // the weekly Action fills this in
}
```

## What gets accepted

- The repo is public and has a `SKILL.md` (or a Claude Code plugin that ships one).
- The install command works as written. Test it in a clean project.
- It's about design, UI, UX, motion, accessibility, or frontend craft.
- The description says what the skill does, without marketing language.
