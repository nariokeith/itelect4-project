import { useNavigate } from "react-router";
import type { User } from "../types/index";
import UserCard from "../components/UserCard";
import { allUsers } from "../data/mockData";
import { pageHeading, sectionLabel } from "../styles/ui";

function PeoplePage() {
  const navigate = useNavigate();

  const handleSelect = (user: User): void => {
    navigate(`/people/${user.id}`);
  };

  return (
    <div>
      <p className={sectionLabel}>directory</p>
      <h2 className={`mt-2 ${pageHeading}`}>People</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Select anyone to open their record.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {allUsers.map((u) => (
          <UserCard key={u.id} user={u} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

export default PeoplePage;
