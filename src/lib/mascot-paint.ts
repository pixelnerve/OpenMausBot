export interface StaticAvatarSettings {
  motion: number;
  effects: boolean;
  glyphs: boolean;
  autoBlink: boolean;
  autoExpression: boolean;
}

/** Paint token used by current shapes, with a fallback for the cursor asset
 * that historically shipped one hard-coded black fill. */
export function paintMascotBody(markup: string, paint: string): string {
  if (markup.includes("{{GRADIENT}}")) return markup.replace(/\{\{GRADIENT\}\}/g, paint);
  return markup.replace(/fill=(["'])#000000\1/i, `fill="${paint}"`);
}

/** Channel-wise mix of a hex color toward another, t in 0..1. */
function mix(hex: string, toward: string, t: number): string {
  const a = Number.parseInt(hex.slice(1), 16);
  const b = Number.parseInt(toward.slice(1), 16);
  const channel = (shift: number) => {
    const va = (a >> shift) & 0xff;
    const vb = (b >> shift) & 0xff;
    return Math.round(va + (vb - va) * t);
  };
  return `#${[channel(16), channel(8), channel(0)]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function gradientForHex(fill: string): [string, string, string] {
  return [mix(fill, "#ffffff", 0.55), fill, mix(fill, "#000000", 0.42)];
}

/** A static swatch keeps the render loop alive so its face is drawn, while
 * disabling every autonomous change or body effect. */
export function staticAvatarSettings(): StaticAvatarSettings {
  return { motion: 0, effects: false, glyphs: false, autoBlink: false, autoExpression: false };
}
