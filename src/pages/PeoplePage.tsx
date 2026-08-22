import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { ApiUser } from "../types/index";
import UserCard from "../components/UserCard";
import { fetchUsers } from "../api/client";
import { chromePanel, pageHeading, quietButton, sectionLabel } from "../styles/ui";

function PeoplePage() {
  const navigate = useNavigate();

  const { data, isPending, isError, error, refetch } = useQuery<ApiUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handleSelect = (user: ApiUser): void => {
    navigate(`/people/${user.id}`);
  };

  if (isPending) {
    return (
      <div>
        <p className={sectionLabel}>loading directory</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-[28px] border border-rule bg-white shadow-sm motion-reduce:animate-none dark:border-ink-line dark:bg-ink-raise"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`rounded-2xl p-6 ring-late/25 dark:ring-late-lift/25 ${chromePanel}`}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-late dark:text-late-lift">
          request failed
        </p>
        <h2 className="mt-2 text-lg font-semibold text-ink dark:text-paper">
          The directory didn't load
        </h2>
        <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
          {error.message} &mdash; is json-server running on port 3001?
        </p>
        <button onClick={() => void refetch()} className={`${quietButton} mt-4`}>
          retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className={sectionLabel}>directory</p>
      <h2 className={`mt-2 ${pageHeading}`}>People</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Select anyone to open their record.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((u) => (
          <UserCard key={u.id} user={u} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

export default PeoplePage;
