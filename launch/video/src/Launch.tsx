import React from "react";
import { Composition, Sequence, staticFile, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Better, CLICK_AT, Cta, Demo, Hook, INSTALLED_AT, Install, Mess, PILLS_AT, Proof, Reveal, TYPE_START, TYPE_STEP } from "./scenes";

const FPS = 30;
const T = 10; // transition length in frames
// Scene lengths in frames, in order.
const SCENES = { hook: 105, better: 100, mess: 150, reveal: 105, demo: 180, install: 165, proof: 125, cta: 135 };
const ORDER = Object.keys(SCENES) as (keyof typeof SCENES)[];
// Start frame of each scene on the final timeline (transitions overlap neighbours by T frames).
const START = Object.fromEntries(ORDER.map((k, i) => [k, ORDER.slice(0, i).reduce((a, x) => a + SCENES[x], 0) - i * T])) as Record<keyof typeof SCENES, number>;
const DURATION = ORDER.reduce((a, k) => a + SCENES[k], 0) - (ORDER.length - 1) * T;

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={at} durationInFrames={3 * FPS} layout="none" name={`sfx ${src}`}>
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);

export const LaunchVideo: React.FC = () => (
  <>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={SCENES.hook}><Hook /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Better" durationInFrames={SCENES.better}><Better /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Mess" durationInFrames={SCENES.mess}><Mess /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Reveal" durationInFrames={SCENES.reveal}><Reveal /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Demo" durationInFrames={SCENES.demo}><Demo /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Install" durationInFrames={SCENES.install}><Install /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Proof" durationInFrames={SCENES.proof}><Proof /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="CTA" durationInFrames={SCENES.cta}><Cta /></TransitionSeries.Sequence>
    </TransitionSeries>

    {/* Music bed (generated, see README) */}
    <Audio src={staticFile("music.wav")} volume={f => interpolate(f, [0, 20, DURATION - 45, DURATION], [0, 0.75, 0.75, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

    {/* Sound design: CC0 effects from Kenney (kenney.nl) via soundcn */}
    <Sfx at={START.hook + 20} src="drop_002.ogg" volume={0.5} />
    <Sfx at={START.hook + 64} src="error_004.ogg" volume={0.55} />
    <Sfx at={START.better + 34} src="pluck_001.ogg" volume={0.5} />
    <Sfx at={START.mess + 4} src="scroll_002.ogg" volume={0.45} />
    {[0, 1, 2].map(i => <Sfx key={i} at={START.mess + 70 + i * 14} src="select_005.ogg" volume={0.5} />)}
    <Sfx at={START.reveal} src="maximize_008.ogg" volume={0.6} />
    <Sfx at={START.reveal + 14} src="jingle_steel.ogg" volume={0.45} />
    {"edit a video".split("").map((ch, i) => ch === " " ? null : <Sfx key={i} at={START.demo + TYPE_START + i * TYPE_STEP} src={`click_00${(i % 3) + 1}.ogg`} volume={0.35} />)}
    <Sfx at={START.demo + TYPE_START + 12 * TYPE_STEP + 10} src="glass_001.ogg" volume={0.45} />
    <Sfx at={START.install + CLICK_AT} src="click_002.ogg" volume={0.6} />
    <Sfx at={START.install + 80} src="tick_002.ogg" volume={0.4} />
    <Sfx at={START.install + 96} src="tick_002.ogg" volume={0.4} />
    <Sfx at={START.install + INSTALLED_AT} src="confirmation_002.ogg" volume={0.6} />
    {[0, 1, 2, 3, 4].map(i => <Sfx key={i} at={START.proof + PILLS_AT + i * 5} src="glass_001.ogg" volume={0.3} />)}
    <Sfx at={START.cta + 26} src="maximize_006.ogg" volume={0.5} />
  </>
);

export const LaunchComposition: React.FC = () => (
  <Composition id="GivernyLaunch" component={LaunchVideo} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
