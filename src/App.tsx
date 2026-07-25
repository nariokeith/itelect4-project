// src/App.tsx
import type React from "react";
import { useState, useEffect, useRef } from "react";
import UserCard from "./components/UserCard";
import CourseCard from "./components/CourseCard";
import SubmissionBadge from "./components/SubmissionBadge";
import useToggle from "./hooks/useToggle";
import usePrevious from "./hooks/usePrevious";
import type { User, Course, Submission } from "./types/index";

// ===== MOCK DATA (GT1 types) -- the "server" our useEffect pretends to fetch from =====
const mockUsers: User[] = [
  {
    id: 1, name: "Juan dela Cruz", email: "juan@example.com",
    role: "student", isActive: true,
  },
  {
    id: 2, name: "Maria Santos", email: "maria@example.com",
    role: "instructor", isActive: true,
  },
];
const mockCourses: Course[] = [
  {
    code: "ITELECT4", title: "IT Elective 4",
    units: 3, semester: "1st Semester 2026-2027",
  },
  {
    code: "ITELECT3", title: "Web Systems and Technologies",
    units: 3, semester: "1st Semester 2026-2027",
  },
  {
    code: "CS101", title: "Introduction to Computing",
    units: 3, semester: "1st Semester 2026-2027",
  },
];
const mockSubmissions: Submission[] = [
  {
    id: 1, studentId: 1, courseCode: "ITELECT4",
    repoUrl: "github.com/juandc/itelect4-project",
    submittedAt: new Date(), score: 95,
  },
];

function App() {
  // ===== TYPED STATE WITH useState<T> =====
  // useState<T> -- T is the type of the state value
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Array state -- starts empty, filled after "loading"
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Boolean state -- tracks whether data has finished loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // String state -- whatever is typed into the search input
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ===== TYPED DOM REFERENCE WITH useRef =====
  // useRef<T>(null) -- T is the DOM element type
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ===== CUSTOM HOOKS =====
  const [showDetails, toggleDetails] = useToggle(false);
  const previousSearch = usePrevious(searchTerm);

  // ===== LOADING MOCK DATA WITH useEffect =====
  // useEffect(fn, deps) -- fn runs after render;
  // an empty deps array [] means "run once, on mount"
  useEffect(() => {
    setTimeout(() => {
      setUsers(mockUsers);
      setCourses(mockCourses);
      setSubmissions(mockSubmissions);
      setIsLoading(false);
    }, 500);
  }, []);

  const focusSearch = (): void => {
    // .current can be null, so optional chaining guards the call
    searchInputRef.current?.focus();
  };

  // Focus the input programmatically once loading finishes
  useEffect(() => {
    if (!isLoading) {
      focusSearch();
    }
  }, [isLoading]);

  // ===== TYPED DOM EVENTS =====
  // React.ChangeEvent<HTMLInputElement> types e.target as an <input>
  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  // Derived value -- recomputed every render, not stored in state
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Early return keeps the loading UI simple
  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  return (
    <div className="app">
      <h1>ITELECT4 Dashboard</h1>

      <input
        ref={searchInputRef}
        type="text"
        value={searchTerm}
        placeholder="Search courses..."
        onChange={handleSearchChange}
      />
      <button onClick={focusSearch}>Focus Search</button>

      {previousSearch !== undefined && previousSearch !== searchTerm && (
        <p>Previous search: "{previousSearch}"</p>
      )}

      {users.map((u) => (
        <UserCard key={u.id} user={u} onSelect={setSelectedUser} />
      ))}
      {selectedUser && <p>Selected: {selectedUser.name}</p>}

      <button onClick={toggleDetails}>
        {showDetails ? "Hide" : "Show"} Details
      </button>

      {showDetails && (
        <div className="details">
          <p>
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          {submissions.map((s) => (
            <SubmissionBadge key={s.id} submission={s}>
              <p>On time!</p>
            </SubmissionBadge>
          ))}
        </div>
      )}

      {filteredCourses.map((c) => (
        <CourseCard key={c.code} course={c} />
      ))}
      {filteredCourses.length === 0 && <p>No courses match "{searchTerm}".</p>}
    </div>
  );
}

export default App;
