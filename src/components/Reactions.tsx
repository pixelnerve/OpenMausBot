// Emoji reactions — iMessage grammar: a hover bar to give one, small chips
// under the bubble to show them. `by` is "user" or a member botId; in rooms
// a bot's own reactions render with its name in the tooltip.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { useStore, type Bot, type Message } from "@/state/store";
import { cn } from "@/lib/cn";

export const REACTION_SET = ["👍", "❤️", "😂", "🎉", "👀"] as const;

export function ReactionBar({ threadId, message }: { threadId: string; message: Message }) {
  const { dispatch } = useStore();
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-hairline/40 bg-panel px-1 py-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      {REACTION_SET.map((emoji) => (
        <button
          key={emoji}
          onClick={() => dispatch({ type: "toggleReaction", threadId, messageId: message.id, emoji })}
          aria-label={`React ${emoji}`}
          className="rounded-full px-1 py-0.5 text-[13px] leading-none hover:bg-raised"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

/** Room reactions use an overlaid touch target on phones, keeping controls out
 * of flex sizing so participant text gets the full readable width. */
export function MobileReactionMenu({ threadId, message }: { threadId: string; message: Message }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="absolute right-0.5 top-0.5 z-10 sm:hidden" data-room-mobile-reactions>
      <button
        type="button"
        aria-label="Message reactions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-full bg-black/15 text-ink-secondary backdrop-blur-sm hover:bg-black/25 hover:text-ink"
      >
        <MoreHorizontal size={18} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Message reactions"
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-50 flex items-center justify-center gap-1 rounded-xl border border-hairline/50 bg-card p-1.5 shadow-2xl shadow-black/50 sm:hidden"
          >
            {REACTION_SET.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                aria-label={`React ${emoji}`}
                onClick={() => {
                  dispatch({ type: "toggleReaction", threadId, messageId: message.id, emoji });
                  setOpen(false);
                }}
                className="flex size-11 items-center justify-center rounded-lg text-[17px] hover:bg-raised"
              >
                {emoji}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function ReactionChips({
  threadId,
  message,
  members,
  align = "left",
}: {
  threadId: string;
  message: Message;
  members?: Bot[];
  align?: "left" | "right";
}) {
  const { dispatch } = useStore();
  const reactions = message.reactions ?? [];
  if (!reactions.length) return null;
  // group identical emoji into one chip with a count
  const grouped = new Map<string, string[]>();
  for (const r of reactions) grouped.set(r.emoji, [...(grouped.get(r.emoji) ?? []), r.by]);
  const nameOf = (by: string) =>
    by === "user" ? "You" : (members?.find((b) => b.id === by)?.name ?? "Bot");
  return (
    <div className={cn("mt-1 flex flex-wrap gap-1", align === "right" ? "justify-end" : "justify-start")}>
      {[...grouped].map(([emoji, bys]) => (
        <button
          key={emoji}
          onClick={() => dispatch({ type: "toggleReaction", threadId, messageId: message.id, emoji })}
          title={bys.map(nameOf).join(", ")}
          className={cn(
            "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[12px] leading-none",
            bys.includes("user")
              ? "border-accent/50 bg-accent/15"
              : "border-hairline/40 bg-panel hover:bg-raised",
          )}
        >
          <span>{emoji}</span>
          {bys.length > 1 && <span className="text-[11px] text-ink-secondary">{bys.length}</span>}
        </button>
      ))}
    </div>
  );
}
