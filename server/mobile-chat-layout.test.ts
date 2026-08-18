import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const chatView = readFileSync(new URL("../src/components/ChatView.tsx", import.meta.url), "utf8");
const groupView = readFileSync(new URL("../src/components/GroupView.tsx", import.meta.url), "utf8");
const reactions = readFileSync(new URL("../src/components/Reactions.tsx", import.meta.url), "utf8");

describe("phone message layout", () => {
  it.each([320, 375, 390, 430])("keeps bubbles readable at a %ipx viewport", (viewportWidth) => {
    const transcriptWidth = viewportWidth - 24;
    expect(transcriptWidth * 0.92).toBeGreaterThanOrEqual(272);
  });

  it("gives bot-chat bubbles their own responsive width", () => {
    expect(chatView).toContain("data-message-bubble-wrapper");
    expect(chatView).toContain('data-message-bubble={user ? "user" : "assistant"}');
    expect(chatView).toContain('className="relative min-w-0 max-w-[92%] sm:max-w-[70%]"');
    expect(chatView).toContain("min-w-0 break-words rounded-2xl");
    expect(chatView).toContain("overflow-x-hidden overflow-y-auto px-3");
  });

  it("removes transparent desktop controls from phone flex sizing", () => {
    expect(chatView).toContain("data-mobile-message-actions");
    expect(chatView).toContain('className="hidden flex-col gap-0.5 self-end pb-0.5 sm:flex"');
    expect(chatView).toContain('className="hidden sm:block"');
    expect(chatView).toContain("createPortal(");
    expect(chatView).toContain('className="flex size-11 items-center justify-center');
  });

  it("applies the same width ownership to room messages", () => {
    expect(groupView).toContain("data-room-message-bubble-wrapper");
    expect(groupView).toContain('data-room-message-bubble={user ? "user" : "participant"}');
    expect(groupView).toContain("min-w-0 max-w-[92%] break-words");
    expect(groupView).toContain("overflow-x-hidden overflow-y-auto px-3");
    expect(reactions).toContain("data-room-mobile-reactions");
    expect(reactions).toContain("createPortal(");
  });
});
