import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";

// Fonts ship with the project (public/fonts), so renders never depend on the network.
export const DISPLAY = "Unbounded", SANS = "Geist", MONO = "Geist Mono";
const FONTS: [string, string, string][] = [
  [DISPLAY, "600", "Unbounded-600"], [DISPLAY, "700", "Unbounded-700"],
  [SANS, "400", "Geist-400"], [SANS, "500", "Geist-500"], [SANS, "600", "Geist-600"],
  [MONO, "400", "GeistMono-400"], [MONO, "500", "GeistMono-500"],
];
FONTS.forEach(([family, weight, file]) => { loadFont({ family, weight, url: staticFile(`fonts/${file}.woff2`) }); });

export const C = {
  night: "#0A0F1F",
  night2: "#121A33",
  ink: "#EEF1FA",
  ink2: "#A9B1CC",
  ink3: "#6E7696",
  design: "#FF5C8A",
  media: "#FFB020",
  coding: "#3DD6F5",
  marketing: "#34D399",
  productivity: "#9B87FF",
};
export const SECTION_COLORS = [C.design, C.media, C.coding, C.marketing, C.productivity];
export const GRADIENT = "linear-gradient(90deg, #FF5C8A, #FFB020 30%, #3DD6F5 60%, #9B87FF 90%)";
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Deterministic pseudo-random numbers, so every render is identical.
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const Background: React.FC<{ glow?: string }> = ({ glow = "#18214A" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 18%, ${glow} 0%, ${C.night} 58%, #05080F 100%)` }} />
);

// The skill field: drifting dots in the five section colours, like the site's hero.
export const Field: React.FC<{ count?: number; opacity?: number; lit?: number; litColor?: string }> = ({ count = 260, opacity = 0.5, lit = 0, litColor }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        {new Array(count).fill(0).map((_, i) => {
          const color = SECTION_COLORS[i % 5];
          const bx = rand(i + 1) * width;
          const by = rand(i + 101) * height;
          const r = 10 + rand(i + 7) * 40;
          const sp = 0.004 + rand(i + 3) * 0.01;
          const x = bx + Math.cos(frame * sp + i) * r;
          const y = by + Math.sin(frame * sp * 1.3 + i) * r;
          const isLit = rand(i + 55) < lit && (!litColor || color === litColor);
          const size = isLit ? 7 : 2.4 + rand(i + 9) * 2.4;
          return <rect key={i} x={x - size / 2} y={y - size / 2} width={size} height={size} fill={color} opacity={isLit ? 1 : opacity * (0.4 + rand(i + 11) * 0.6)} rx={size / 4} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Words rise in one after another.
export const Words: React.FC<{ text: string; delay?: number; style?: React.CSSProperties; gradient?: boolean; stagger?: number }> = ({ text, delay = 0, style, gradient, stagger = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", ...style }}>
      {text.split(" ").map((w, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 200 }, durationInFrames: Math.round(0.6 * fps) });
        return (
          <span key={i} style={{
            display: "inline-block",
            opacity: p,
            translate: `0 ${interpolate(p, [0, 1], [40, 0])}px`,
            filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
            ...(gradient ? { backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}),
          }}>{w}</span>
        );
      })}
    </div>
  );
};

export const Mark: React.FC<{ size: number; progress?: number }> = ({ size, progress = 1 }) => {
  const pts = [[16, 7.5], [24.1, 13.4], [21, 23], [11, 23], [7.9, 13.4]];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {pts.map(([x, y], i) => {
        const p = interpolate(progress, [i * 0.12, i * 0.12 + 0.5], [0, 1], { ...clamp, easing: EASE });
        return <circle key={i} cx={16 + (x - 16) * p} cy={16 + (y - 16) * p} r={5 * p} fill={SECTION_COLORS[i]} />;
      })}
      <circle cx={16} cy={16} r={3.2 * interpolate(progress, [0.5, 1], [0, 1], clamp)} fill="#fff" />
    </svg>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color, style }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 26px", borderRadius: 999,
    background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.14)", color: C.ink,
    fontFamily: SANS, fontSize: 34, fontWeight: 500, ...style,
  }}>
    {color ? <span style={{ width: 16, height: 16, borderRadius: 99, background: color, boxShadow: `0 0 18px ${color}` }} /> : null}
    {children}
  </div>
);
