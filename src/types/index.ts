    export interface User {
        id: number;
        name: string;
        email: string;
        role: "student" | "admin" | "instructor";
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
        score?: number;
    }

export type ID = number | string;
export type Coordinate = {
  x: number;
  y: number;
};

export type Formatter = (value: number) => string;

const studentId: ID = "S2026-001";
const position: Coordinate = { x: 10, y: 20 };
const formatScore: Formatter = (value) => `${value}%`;
console.log(studentId);
console.log(formatScore(95.5));

export type StringOrNumber = string | number;
export type Status = "pending" | "active" | "inactive";
export function printId(id: StringOrNumber): void {
  console.log(`ID: ${id}`);
}
printId(101);
printId("S2026-001");

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

export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

export type UserUpdate = Partial<User>;

export type UserPreview = Pick<User, "id" | "name" | "role">;

export type PublicUser = Omit<User, "email" | "isActive">;

export type RoleCount = Record<
  "student" | "admin" | "instructor",
  number
>;

export enum SubmissionStatus {
  Pending,
  Graded,
  Late,
}

export const enum Role {
  Student    = "student",
  Admin      = "admin",
  Instructor = "instructor",
}

// ---------------------------------------------------------------- SESSION 7
// The shapes the API actually returns, which are NOT the ones declared above.
// JSON has no Date, and json-server rewrites every `id` as a string -- even
// when db.json spells it as a number. Both types below are DERIVED from the
// originals, so User and Submission stay the single source of truth: add a
// field there and these inherit it.

// Omit is from Session 2. The & intersection is from Session 1.

export type ApiUser = Omit<User, "id"> & {
  id: string; // json-server hands back "3", never 3
};

export type ApiSubmission = Omit<
  Submission,
  "id" | "studentId" | "submittedAt"
> & {
  id: string; // json-server ids look like "z4U3v8og06g"
  studentId: string; // a reference to ApiUser["id"], so it is a string too
  submittedAt: string; // an ISO string, never a Date object
};

// What we SEND when creating one. No id yet -- the server makes it.
export type NewSubmission = Omit<ApiSubmission, "id">;
