import { useEffect } from "react";
import useArrowCursor from "../hooks/useArrowCursor";

function ArrowCursor() {
  const { cursorRef, isEnabled } = useArrowCursor();

  useEffect(() => {
    if (!isEnabled) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    return () => root.classList.remove("has-custom-cursor");
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] -mt-3 -ml-[18px] h-6 w-9 text-ink opacity-0 transition-opacity duration-200 will-change-transform dark:text-paper"
    >
      <div
        data-arrow
        className="h-full w-full transition-[scale] duration-200 ease-out will-change-transform"
      >
        <svg
          width="36"
          height="24"
          viewBox="-18 -12 36 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M0 0-16-7.5-11.5 0-16 7.5Z" />
        </svg>
      </div>
    </div>
  );
}

export default ArrowCursor;
