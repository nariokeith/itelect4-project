# itelect4-project

## Project Concept

A mini course-submission tracker for ITELECT4. The system models **Users** (students, admins, and instructors), the **Courses** they take, and the **Submissions** they turn in for graded tasks. A student submits a GitHub repository link for a course, the submission moves through a status lifecycle (Pending → Graded / Late), and instructors can review and score it. This project is built incrementally across the semester — every graded task (GT1–GT6) imports and extends the shared types defined in `types/index.ts`.

## Interfaces / Types Defined So Far

**Interfaces**
- `User` — id, name, email, role (`"student" | "admin" | "instructor"`), isActive
- `Course` — code, title, units, semester
- `Submission` — id, studentId, courseCode, repoUrl, submittedAt, score (optional)
- `ApiResponse<T>` — generic wrapper for any API response (success, data, message)

**Type Aliases / Unions / Intersections**
- `ID`, `Coordinate`, `Formatter`
- `StringOrNumber`, `Status`
- `StudentWithCourse` — `User` intersected with enrolledCourse + gpa

**Utility Types**
- `UserUpdate` — `Partial<User>`
- `UserPreview` — `Pick<User, "id" | "name" | "role">`
- `PublicUser` — `Omit<User, "email" | "isActive">`
- `RoleCount` — `Record<"student" | "admin" | "instructor", number>`

**Enums**
- `SubmissionStatus` — regular enum (Pending, Graded, Late)
- `Role` — const enum (Student, Admin, Instructor)

## How to Install and Run

```bash
npm install
npx ts-node src/index.ts
```

To type-check without emitting JS:

```bash
npx tsc --noEmit
```
