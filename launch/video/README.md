# Giverny launch video

A 33-second vertical (1080×1920) launch video, built with [Remotion](https://remotion.dev) following the
official Remotion skill (`remotion-dev/skills`, listed on Giverny under Video & media).

Rendered output: `../giverny-launch.mp4`, plus a cover frame at `../giverny-launch-cover.png`.

## Scenes

1. **Hook**: "Your AI-built app looks like everyone else's."
2. **Problem**: "Claude can do much better. It just needs the right skills."
3. **Mess**: 10,000+ skills scattered across 316 GitHub repos. No search, different installs, hours of digging.
4. **Reveal**: Giverny. Every Claude skill. One search.
5. **Demo**: typing "edit a video" returns FFmpeg, HyperFrames and Video Toolkit.
6. **Install**: copy the prompt, paste into Claude Code, "HyperFrames installed".
7. **Proof**: 10,838 skills, 316 repos, five sections, updated weekly.
8. **CTA**: giverny-two.vercel.app.

## Edit and re-render

```bash
npm install
node scripts/make-music.mjs  # create public/music.wav (needed once)
npx remotion studio          # live preview and editing
node scripts/make-music.mjs  # regenerate the music bed (synthesised, no samples)
npx remotion render GivernyLaunch ../giverny-launch.mp4 --codec=h264 --crf=18
```

Scene text and timing live in `src/scenes.tsx`; scene order, transitions and sound cues in `src/Launch.tsx`.

## Credits

- Sound effects: Kenney (kenney.nl) interface and sci-fi packs, CC0, via soundcn.
- Music: synthesised by `scripts/make-music.mjs`.
- Fonts: Unbounded and Geist (SIL Open Font License), bundled in `public/fonts`.
