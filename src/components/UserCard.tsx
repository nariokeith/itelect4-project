import type React from "react";
import useMiniTilt from "../hooks/useMiniTilt";
import type { User } from "../types/index";

interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

const cardFace =
  "group relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-linear-to-b from-bevel-hi to-bevel-lo p-6 shadow-card transition-[translate] duration-500 ease-[cubic-bezier(0.6,0,0.2,1)] hover:[translate:0_-8px] motion-reduce:transition-none motion-reduce:hover:[translate:0_0] dark:from-bevel-hi-dark dark:to-bevel-lo-dark dark:shadow-card-dark";

const tagChip =
  "rounded-full bg-ink/6 px-3 py-1 font-mono text-[0.625rem] font-medium tracking-[0.18em] text-graphite uppercase dark:bg-paper/10 dark:text-graphite-lift";

const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .filter((c) => c === c.toUpperCase())
    .slice(0, 2)
    .join("");

function UserCard({ user, onSelect }: UserCardProps) {
  const cardRef = useMiniTilt();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onSelect(user);
  };

  return (
    <div ref={cardRef} className={cardFace}>
      <div className="flex items-center justify-between gap-3">
        <div
          data-mini
          aria-hidden="true"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-linear-to-b from-tile-hi to-tile-lo font-mono text-base font-semibold text-paper shadow-mini will-change-transform dark:from-tile-hi-dark dark:to-tile-lo-dark dark:text-ink dark:shadow-mini-dark"
        >
          {initials(user.name)}
        </div>
        <span className={tagChip}>{user.role}</span>
      </div>

      <h3 className="text-base font-semibold text-ink dark:text-paper">
        {user.name}
      </h3>

      <p className="flex-1 truncate font-mono text-xs text-graphite dark:text-graphite-lift">
        {user.email}
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-rule pt-3.5 dark:border-ink-line">
        <span
          className={`font-mono text-xs tracking-[0.14em] uppercase ${
            user.isActive
              ? "text-graded dark:text-graded-lift"
              : "text-pending dark:text-pending-lift"
          }`}
        >
          {user.isActive ? "active" : "inactive"}
        </span>

        <button
          onClick={handleClick}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-paper dark:text-ink dark:hover:bg-paper/85 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink"
        >
          Select
        </button>
      </div>
    </div>
  );
}

export default UserCard;
