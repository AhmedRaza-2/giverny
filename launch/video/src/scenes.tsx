import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, C, clamp, DISPLAY, EASE, Field, GRADIENT, Mark, MONO, Pill, rand, SANS, SECTION_COLORS, Words } from "./ui";

const H1: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.04, letterSpacing: "-0.045em", color: C.ink, textAlign: "center" };
const SUB: React.CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: 46, lineHeight: 1.3, color: C.ink2, textAlign: "center" };
const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ padding: "140px 84px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, ...style }}>{children}</AbsoluteFill>
);

/* 1. Hook: everything AI builds looks the same */
const GenericSite: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 18 - i * 6, fps, config: { damping: 18, stiffness: 120 } });
  const rot = [-7, 0, 7][i];
  return (
    <div style={{
      width: 290, height: 470, borderRadius: 28, background: "#F3F4F8", padding: 22, display: "flex", flexDirection: "column", gap: 14,
      boxShadow: "0 30px 80px -30px rgba(0,0,0,.8)", opacity: p,
      translate: `0 ${interpolate(p, [0, 1], [260, 0])}px`, rotate: `${rot * p}deg`,
    }}>
      <div style={{ height: 12, width: 90, borderRadius: 6, background: "#D7DAE5" }} />
      <div style={{ height: 170, borderRadius: 18, background: "linear-gradient(135deg, #7C5CFF, #C25CFF)" }} />
      <div style={{ height: 18, width: "85%", borderRadius: 9, background: "#C9CDDB" }} />
      <div style={{ height: 18, width: "65%", borderRadius: 9, background: "#D7DAE5" }} />
      <div style={{ marginTop: 8, height: 48, width: 150, borderRadius: 14, background: "#7C5CFF" }} />
      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>{[0, 1, 2].map(k => <div key={k} style={{ flex: 1, height: 70, borderRadius: 12, background: "#E3E6EF" }} />)}</div>
    </div>
  );
};
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background glow="#2A1A3E" />
      <Center style={{ justifyContent: "flex-start", paddingTop: 230 }}>
        <Words text="Your AI-built app" style={H1} />
        <Words text="looks like everyone else’s." delay={8} style={{ ...H1, color: C.ink2 }} />
      </Center>
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, paddingTop: 520 }}>
        {[0, 1, 2].map(i => <GenericSite key={i} i={i} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230 }}>
        <div style={{
          ...SUB, color: "#FF6B8F",
          opacity: interpolate(frame, [62, 72], [0, 1], clamp),
          scale: interpolate(frame, [62, 70], [1.3, 1], { ...clamp, easing: EASE }),
        }}>Same gradient. Same layout. Same everything.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 2. Claude can do better */
export const Better: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Field count={180} opacity={0.35} />
    <Center>
      <Words text="Claude can do much better." style={H1} />
      <Words text="It just needs the right skills." delay={34} gradient style={{ ...H1, fontSize: 96 }} />
    </Center>
  </AbsoluteFill>
);

/* 3. The mess: skills exist, but they're everywhere */
const REPOS = ["obra/superpowers", "anthropics/skills", "mattpocock/skills", "pbakaus/impeccable", "garrytan/gstack", "heygen-com/hyperframes", "remotion-dev/skills", "trailofbits/skills", "coreyhaines31/marketingskills", "vercel-labs/agent-skills", "stripe/ai", "supabase/agent-skills", "getsentry/skills", "elevenlabs/skills", "fal-ai-community/skills", "Leonxlnx/taste-skill", "emilkowalski/skills", "google/skills", "openai/skills", "cloudflare/skills", "AgriciDaniel/claude-seo", "figma/mcp-server-guide", "expo/skills", "nextlevelbuilder/ui-ux-pro-max-skill", "wshobson/agents", "K-Dense-AI/scientific-agent-skills", "phuryn/pm-skills", "greensock/gsap-skills", "microsoft/skills", "huggingface/skills", "JetBrains/skills", "affaan-m/ECC", "davila7/claude-code-templates", "nexu-io/open-design", "OpenMontageInc/OpenMontage", "addyosmani/agent-skills", "MiniMax-AI/skills", "better-auth/skills", "redis/agent-skills", "mongodb/agent-skills"];
export const Mess: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const count = Math.round(interpolate(frame, [4, 40], [0, 10000], { ...clamp, easing: EASE }));
  return (
    <AbsoluteFill>
      <Background glow="#1A1F3A" />
      <AbsoluteFill>
        {REPOS.map((r, i) => {
          const p = spring({ frame: frame - 20 - i * 1.6, fps, config: { damping: 14, stiffness: 90 } });
          const x = 200 + rand(i + 3) * (width - 400);
          const y = 640 + rand(i + 17) * 760;
          return (
            <div key={r} style={{
              position: "absolute", left: x, top: y, marginLeft: -170, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", padding: "10px 18px", borderRadius: 14, whiteSpace: "nowrap",
              background: "rgba(255,255,255,.06)", border: `1.5px solid ${SECTION_COLORS[i % 5]}55`, color: C.ink2,
              fontFamily: MONO, fontSize: 24, opacity: p * 0.9,
              translate: `0 ${interpolate(p, [0, 1], [-500 - rand(i) * 300, 0])}px`, rotate: `${(rand(i + 9) - 0.5) * 24}deg`,
            }}>{r}</div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: "200px 84px 0", alignItems: "center" }}>
        <div style={{ ...H1, fontSize: 150, backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontVariantNumeric: "tabular-nums" }}>{count.toLocaleString("en-US")}+</div>
        <Words text="Claude skills exist…" delay={10} style={{ ...H1, fontSize: 76 }} />
        <Words text="scattered across 316 GitHub repos." delay={26} style={{ ...SUB, marginTop: 22 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170, gap: 18 }}>
        {["No search", "A different install for each", "Hours of digging"].map((t, i) => {
          const s = 70 + i * 14;
          return (
            <div key={t} style={{
              display: "flex", alignItems: "center", gap: 18, padding: "16px 30px", borderRadius: 20,
              background: "rgba(10,15,31,.88)", border: "1.5px solid rgba(255,92,138,.45)",
              fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.ink,
              opacity: interpolate(frame, [s, s + 6], [0, 1], clamp),
              scale: interpolate(frame, [s, s + 8], [0.8, 1], { ...clamp, easing: EASE }),
            }}><span style={{ color: "#FF5C8A", fontSize: 48 }}>✕</span>{t}</div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 4. The answer: Giverny */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: EASE });
  const word = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill>
      <Background glow="#1E2A5A" />
      <Field count={220} opacity={interpolate(frame, [0, 30], [0.1, 0.45], clamp)} />
      <Center style={{ gap: 30 }}>
        <div style={{ scale: interpolate(mark, [0, 1], [0.6, 1]), rotate: `${interpolate(mark, [0, 1], [-90, 0])}deg` }}><Mark size={260} progress={mark} /></div>
        <div style={{ ...H1, fontSize: 132, opacity: word, translate: `0 ${interpolate(word, [0, 1], [30, 0])}px` }}>Giverny</div>
        <Words text="Every Claude skill." delay={30} style={{ ...H1, fontSize: 76, marginTop: 30 }} />
        <Words text="One search." delay={40} gradient style={{ ...H1, fontSize: 76 }} />
      </Center>
    </AbsoluteFill>
  );
};

/* 5. Demo: say what you want, get the right skills */
const QUERY = "edit a video";
const RESULTS = [
  { name: "FFmpeg", by: "Digital Samba", badges: ["Best match"], desc: "Video and audio processing with FFmpeg: convert, trim, compress, caption.", stars: "2.8k" },
  { name: "HyperFrames", by: "HeyGen", badges: ["Best match", "Official"], desc: "Edit your footage or make videos from HTML, then render to MP4.", stars: "92k" },
  { name: "Video Toolkit", by: "Digital Samba", badges: ["Pick"], desc: "Script, AI voiceover, music, clips and render on open-source tools.", stars: "2.8k" },
];
export const TYPE_START = 14, TYPE_STEP = 3;
const Badge: React.FC<{ t: string }> = ({ t }) => (
  <span style={{
    fontFamily: SANS, fontSize: 24, fontWeight: 600, padding: "5px 14px", borderRadius: 10,
    ...(t === "Best match" ? { background: "linear-gradient(90deg,#FF5C8A,#8B75FF)", color: "#fff" } : t === "Official" ? { background: "rgba(52,211,153,.16)", color: "#5EE6B0" } : { background: "rgba(155,135,255,.18)", color: "#C4B8FF" }),
  }}>{t}</span>
);
export const ResultCard: React.FC<{ r: typeof RESULTS[number]; p: number; children?: React.ReactNode }> = ({ r, p, children }) => (
  <div style={{
    width: 912, borderRadius: 30, padding: "30px 34px", background: "rgba(18,26,51,.92)", border: "1.5px solid rgba(255,255,255,.1)",
    borderLeft: `8px solid ${C.media}`, boxShadow: "0 30px 70px -30px rgba(0,0,0,.9)",
    opacity: p, translate: `0 ${interpolate(p, [0, 1], [80, 0])}px`,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 48, letterSpacing: "-0.03em", color: C.ink }}>{r.name}</div>
      <div style={{ fontFamily: SANS, fontSize: 30, color: C.ink3 }}><span style={{ color: C.media }}>★</span> {r.stars}</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
      <span style={{ fontFamily: SANS, fontSize: 28, color: C.ink3, marginRight: 6 }}>{r.by}</span>
      {r.badges.map(b => <Badge key={b} t={b} />)}
    </div>
    <div style={{ fontFamily: SANS, fontSize: 32, lineHeight: 1.4, color: C.ink2, marginTop: 16 }}>{r.desc}</div>
    {children}
  </div>
);
export const SearchBar: React.FC<{ text: string; caret: boolean }> = ({ text, caret }) => (
  <div style={{
    width: 912, height: 128, borderRadius: 36, background: "#fff", display: "flex", alignItems: "center", gap: 24, padding: "0 40px",
    boxShadow: "0 0 0 4px rgba(155,135,255,.45), 0 40px 90px -30px rgba(61,214,245,.55)",
  }}>
    <svg width="44" height="44" viewBox="0 0 20 20" fill="none" stroke="#7B8198" strokeWidth="2" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4.5 4.5" /></svg>
    <div style={{ fontFamily: SANS, fontSize: 48, color: text ? "#0B1020" : "#8A90A6" }}>{text || "What do you want Claude to do?"}<span style={{ opacity: caret ? 1 : 0, color: "#8B75FF" }}>|</span></div>
  </div>
);
export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = QUERY.slice(0, Math.max(0, Math.floor((frame - TYPE_START) / TYPE_STEP)));
  const doneTyping = TYPE_START + QUERY.length * TYPE_STEP;
  const lit = interpolate(frame, [doneTyping, doneTyping + 20], [0, 0.6], clamp);
  return (
    <AbsoluteFill>
      <Background glow="#2A2440" />
      <Field count={260} opacity={0.22} lit={lit} litColor={C.media} />
      <AbsoluteFill style={{ padding: "140px 84px", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <Words text="Say what you want to do." style={{ ...SUB, color: C.ink }} />
        <SearchBar text={typed} caret={Math.floor(frame / 8) % 2 === 0} />
        <div style={{ fontFamily: SANS, fontSize: 32, color: C.ink3, opacity: interpolate(frame, [doneTyping + 4, doneTyping + 12], [0, 1], clamp) }}>
          258 skills match. Best matches first.
        </div>
        {RESULTS.map((r, i) => <ResultCard key={r.name} r={r} p={spring({ frame: frame - doneTyping - 10 - i * 9, fps, config: { damping: 200 } })} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 6. Copy the prompt, paste into Claude Code, done */
export const CLICK_AT = 34, INSTALLED_AT = 128;
const TERMINAL = [
  { at: 58, text: '> Install "HyperFrames" for Claude Code from', color: C.ink },
  { at: 58, text: "  github.com/heygen-com/hyperframes …", color: C.ink2 },
  { at: 80, text: "⏺ claude plugin marketplace add heygen-com/hyperframes", color: C.coding },
  { at: 96, text: "⏺ claude plugin install hyperframes@hyperframes", color: C.coding },
];
export const Install: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copied = frame >= CLICK_AT;
  const cursorP = interpolate(frame, [8, CLICK_AT - 4], [0, 1], { ...clamp, easing: EASE });
  const term = spring({ frame: frame - 48, fps, config: { damping: 200 } });
  const done = spring({ frame: frame - INSTALLED_AT, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Background glow="#16304A" />
      <AbsoluteFill style={{ padding: "140px 84px", alignItems: "center", justifyContent: "center", gap: 44 }}>
        <Words text="Copy one prompt." style={{ ...H1, fontSize: 84 }} />
        <div style={{ position: "relative" }}>
          <ResultCard r={RESULTS[1]} p={1}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
              <div style={{
                fontFamily: SANS, fontWeight: 600, fontSize: 34, padding: "18px 34px", borderRadius: 20,
                background: copied ? "#16A34A" : "#EEF1FA", color: copied ? "#fff" : "#0B1020",
                scale: interpolate(frame, [CLICK_AT - 2, CLICK_AT, CLICK_AT + 5], [1, 0.92, 1], clamp),
              }}>{copied ? "✓ Copied" : "Copy prompt"}</div>
            </div>
          </ResultCard>
          <svg width="64" height="64" viewBox="0 0 24 24" style={{ position: "absolute", left: interpolate(cursorP, [0, 1], [120, 760]), top: interpolate(cursorP, [0, 1], [420, 300]), opacity: interpolate(frame, [4, 10, 50, 58], [0, 1, 1, 0], clamp) }}>
            <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#0B1020" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{
          width: 912, borderRadius: 28, overflow: "hidden", background: "#05070E", border: "1.5px solid rgba(255,255,255,.12)",
          boxShadow: "0 40px 100px -30px rgba(0,0,0,.9)", opacity: term, translate: `0 ${interpolate(term, [0, 1], [120, 0])}px`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", background: "#11162A" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
            <span style={{ fontFamily: SANS, fontSize: 26, color: C.ink3, marginLeft: 14 }}>Claude Code</span>
          </div>
          <div style={{ padding: "26px 30px 34px", display: "flex", flexDirection: "column", gap: 12, minHeight: 330 }}>
            {TERMINAL.map((l, i) => (
              <div key={i} style={{ fontFamily: MONO, fontSize: 27, color: l.color, whiteSpace: "pre", opacity: interpolate(frame, [l.at, l.at + 4], [0, 1], clamp) }}>{l.text}</div>
            ))}
            <div style={{
              marginTop: 14, alignSelf: "flex-start", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: "#34D399",
              opacity: done, scale: interpolate(done, [0, 1], [0.7, 1]),
            }}>✓ HyperFrames installed</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 7. Proof: the numbers */
const SECTIONS = [["Design", C.design], ["Video & media", C.media], ["Coding", C.coding], ["Marketing", C.marketing], ["Productivity", C.productivity]];
export const PILLS_AT = 46;
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(frame, [0, 36], [0, 10838], { ...clamp, easing: EASE }));
  return (
    <AbsoluteFill>
      <Background glow="#1B2550" />
      <Field count={300} opacity={0.4} />
      <Center style={{ gap: 26 }}>
        <div style={{ ...H1, fontSize: 200, fontVariantNumeric: "tabular-nums", backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{n.toLocaleString("en-US")}</div>
        <Words text="Claude skills, from 316 repos." delay={14} style={{ ...H1, fontSize: 64 }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 30, maxWidth: 900 }}>
          {SECTIONS.map(([label, color], i) => {
            const p = spring({ frame: frame - PILLS_AT - i * 5, fps, config: { damping: 12, stiffness: 170 } });
            return <div key={label} style={{ opacity: p, scale: interpolate(p, [0, 1], [0.5, 1]) }}><Pill color={color}>{label}</Pill></div>;
          })}
        </div>
        <Words text="Searched by intent. Updated every week." delay={80} style={{ ...SUB, marginTop: 30 }} />
      </Center>
    </AbsoluteFill>
  );
};

/* 8. Call to action */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = spring({ frame: frame - 26, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Background glow="#22205A" />
      <Field count={240} opacity={0.4} />
      <Center style={{ gap: 40 }}>
        <Mark size={170} progress={interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: EASE })} />
        <Words text="Give Claude any skill." style={{ ...H1, fontSize: 96 }} />
        <div style={{
          padding: 4, borderRadius: 34, backgroundImage: GRADIENT, opacity: url, scale: interpolate(url, [0, 1], [0.7, 1]), marginTop: 10,
        }}>
          <div style={{ padding: "28px 44px", borderRadius: 30, background: C.night, fontFamily: MONO, fontWeight: 500, fontSize: 52, color: C.ink }}>giverny-two.vercel.app</div>
        </div>
        <Words text="Free. Sign in with GitHub and star to unlock." delay={44} style={{ ...SUB, fontSize: 40 }} />
        <div style={{ fontFamily: SANS, fontSize: 32, color: C.ink3, opacity: interpolate(frame, [70, 84], [0, 1], clamp), marginTop: 20 }}>Link in bio</div>
      </Center>
    </AbsoluteFill>
  );
};
