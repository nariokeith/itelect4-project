import type { User, Course, Submission } from "../types/index";

export const allUsers: User[] = [
  {
    id: 1, name: "Juan dela Cruz", email: "juan@example.com",
    role: "student", isActive: true,
  },
  {
    id: 2, name: "Maria Santos", email: "maria@example.com",
    role: "instructor", isActive: true,
  },
  {
    id: 3, name: "Andrea Reyes", email: "andrea@example.com",
    role: "student", isActive: true,
  },
  {
    id: 4, name: "Paolo Mendoza", email: "paolo@example.com",
    role: "student", isActive: false,
  },
  {
    id: 5, name: "Liza Chua", email: "liza@example.com",
    role: "admin", isActive: true,
  },
];

export const allCourses: Course[] = [
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

export const allSubmissions: Submission[] = [
  {
    id: 1, studentId: 1, courseCode: "ITELECT4",
    repoUrl: "github.com/juandc/itelect4-project",
    submittedAt: new Date(2026, 7, 8), score: 95,
  },
  {
    id: 2, studentId: 1, courseCode: "ITELECT3",
    repoUrl: "github.com/juandc/itelect3-final",
    submittedAt: new Date(2026, 7, 12),
  },
  {
    id: 3, studentId: 3, courseCode: "ITELECT4",
    repoUrl: "github.com/areyes/itelect4-tracker",
    submittedAt: new Date(2026, 7, 9), score: 88,
  },
  {
    id: 4, studentId: 4, courseCode: "CS101",
    repoUrl: "github.com/pmendoza/cs101-exercises",
    submittedAt: new Date(2026, 6, 30),
  },
  {
    id: 5, studentId: 3, courseCode: "CS101",
    repoUrl: "github.com/areyes/cs101-machine-problem",
    submittedAt: new Date(2026, 6, 28), score: 79,
  },
];
