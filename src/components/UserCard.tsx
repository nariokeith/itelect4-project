// src/components/UserCard.tsx
import type React from "react";
import type { User } from "../types/index";

interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

function UserCard({ user, onSelect }: UserCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onSelect(user);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={handleClick}>Select</button>
    </div>
  );
}

export default UserCard;
