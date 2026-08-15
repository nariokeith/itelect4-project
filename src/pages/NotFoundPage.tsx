import { Link } from "react-router";
import { pageHeading, notFoundLabel, notFoundPanel } from "../styles/ui";

function NotFoundPage() {
  return (
    <div className={notFoundPanel}>
      <p className={notFoundLabel}>no route matched</p>
      <h2 className={`mt-2 ${pageHeading}`}>404 — Page Not Found</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        That URL does not exist in this tracker.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-paper dark:text-ink dark:hover:bg-paper/85 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink"
      >
        Go back to the Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
