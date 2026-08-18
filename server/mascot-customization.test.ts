import { describe, expect, it } from "vitest";

import { gradientForHex, paintMascotBody, staticAvatarSettings } from "../src/lib/mascot-paint.ts";

describe("bot mascot customization", () => {
  it("repaints the legacy cursor silhouette with the instance gradient", () => {
    const painted = paintMascotBody('<path fill="#000000" d="M0 0"/>', "url(#bot-gradient)");
    expect(painted).toContain('fill="url(#bot-gradient)"');
    expect(painted).not.toContain('fill="#000000"');
  });

  it("keeps static expression swatches drawable while disabling autonomous animation", () => {
    expect(staticAvatarSettings()).toEqual({
      motion: 0,
      effects: false,
      glyphs: false,
      autoBlink: false,
      autoExpression: false,
    });
    expect(staticAvatarSettings()).not.toHaveProperty("paused");
  });

  it("produces visibly different gradients for each offered color", () => {
    const fills = ["#009957", "#377FE6", "#D94B52", "#E78531", "#8057C8", "#0EA5C6", "#D84F8B", "#D8A729", "#01A492", "#E5634E"];
    const gradients = fills.map((fill) => gradientForHex(fill).join(","));
    expect(new Set(gradients).size).toBe(gradients.length);
    expect(gradientForHex("#009957")[1]).toBe("#009957");
  });
});
