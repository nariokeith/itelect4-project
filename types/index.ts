// ===== INTERFACES =====
// An interface defines the SHAPE of an object -- what fields it must have.
    export interface User {
        id: number;
        name: string;
        email: string;
        role: "student" | "admin" | "instructor"; // only these values
        isActive: boolean;
    }
        export interface Course {
        code: string;
        title: string;
        units: number;
        semester: string;
    }
    export interface Submission {
        id: number;
        studentId: number;
        courseCode: string;
        repoUrl: string;
        submittedAt: Date;
        score?: number; // ? means this field is optional
    }

// ===== TYPE ALIASES =====
// A type alias gives a name to any type -- primitives, unions, functions, objects
// Alias for a union type (string OR number)
export type ID = number | string;
// Alias for an object shape
export type Coordinate = {
  x: number;
  y: number;
};

// Alias for a function signature
export type Formatter = (value: number) => string;

// Using them
const studentId: ID = "S2026-001";
const position: Coordinate = { x: 10, y: 20 };
const formatScore: Formatter = (value) => `${value}%`;
console.log(studentId); // S2026-001
console.log(formatScore(95.5)); // 95.5%

// ===== UNION TYPES -- One OR the other =====
export type StringOrNumber = string | number;
export type Status = "pending" | "active" | "inactive"; // literal union
// Function that accepts a union type
export function printId(id: StringOrNumber): void {
  console.log(`ID: ${id}`);
}
printId(101);
printId("S2026-001");

// ===== INTERSECTION TYPES -- combines ALL properties =====
// StudentWithCourse must have all User fields AND enrolledCourse AND gpa
export type StudentWithCourse = User & {
  enrolledCourse: Course;
  gpa: number;
};

const topStudent: StudentWithCourse = {
  id: 1,
  name: "Maria Santos",
  email: "m@example.com",
  role: "student",
  isActive: true,
  enrolledCourse: {
    code: "ITELECT4",
    title: "IT Elective 4",
    units: 3,
    semester: "1st",
  },
  gpa: 1.25,
};
