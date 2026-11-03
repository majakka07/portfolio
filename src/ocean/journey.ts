import type { Vector3 } from 'three';

const MathUtils = {
  clamp: (x: number, min: number, max: number) =>
    Math.max(min, Math.min(max, x)),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  smoothstep: (x: number, min: number, max: number) => {
    const t = Math.max(0, Math.min(1, (x - min) / (max - min)));
    return t * t * (3 - 2 * t);
  },
};

/** Optional deterministic screenshot harness: ?t=0..1 seeks the full journey. */
const seek = new URLSearchParams(window.location.search).get('t');
export const frozenProgress =
  seek !== null && Number.isFinite(Number(seek))
    ? Math.max(0, Math.min(1, Number(seek)))
    : null;
export const sceneTime = (elapsed: number) =>
  frozenProgress === null ? elapsed : frozenProgress * 15;

/** Shared scroll playhead. Mutated outside React so scrolling never rerenders the tree. */
export const journey = { progress: 0 };

// Positions use metres: water at 0, logo at +1.1, seabed at -12.
// Each stop aligns with a document section; smoothstep eases the dive and final turn.
const stops = [
  { at: 0, eye: [0, 2.3, 7], target: [0, 1.1, 0], roll: 0 },
  { at: 0.04, eye: [0.2, 0.8, 5.8], target: [0, 0.1, -1], roll: 0 },
  { at: 0.12, eye: [0.3, -3, 3], target: [0, -3.2, -6], roll: 0.015 },
  { at: 0.4, eye: [-0.6, -4.3, -1], target: [0, -4.1, -10], roll: -0.025 },
  { at: 0.58, eye: [0.7, -5, -6], target: [0, -4.8, -16], roll: 0.02 },
  { at: 0.76, eye: [-0.4, -5.8, -11], target: [0, -6, -22], roll: -0.015 },
  { at: 1, eye: [0, -8.6, -15], target: [0, -12, -19], roll: -0.08 },
];

export function sampleJourney(progress: number, eye: Vector3, target: Vector3) {
  const p = MathUtils.clamp(progress, 0, 1);
  const index = Math.max(0, stops.findIndex((stop) => stop.at >= p) - 1);
  const a = stops[index];
  const b = stops[Math.min(index + 1, stops.length - 1)];
  const t = MathUtils.smoothstep(p, a.at, b.at);
  eye.set(...(a.eye as [number, number, number]));
  target.set(...(a.target as [number, number, number]));
  eye.x = MathUtils.lerp(a.eye[0], b.eye[0], t);
  eye.y = MathUtils.lerp(a.eye[1], b.eye[1], t);
  eye.z = MathUtils.lerp(a.eye[2], b.eye[2], t);
  target.x = MathUtils.lerp(a.target[0], b.target[0], t);
  target.y = MathUtils.lerp(a.target[1], b.target[1], t);
  target.z = MathUtils.lerp(a.target[2], b.target[2], t);
  return MathUtils.lerp(a.roll, b.roll, t);
}
