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

## Routes (GT3 Part 1)

Routing uses **React Router v8** — imported from `react-router`, not `react-router-dom`,
which no longer exists in v8. `src/App.tsx` holds the entire route table and nothing else;
to see what pages exist, read that one file.

| Path | Page | Notes |
|---|---|---|
| `/` | `DashboardPage` | index route |
| `/courses` | `CoursesPage` | search + grid, each card links to its detail page |
| `/courses/:code` | `CourseDetailPage` | URL parameter, `useParams<{ code: string }>()` |
| `/people` | `PeoplePage` | selecting a person navigates with `useNavigate()` |
| `/people/:id` | `PersonDetailPage` | numeric URL parameter, converted and validated |
| `/submissions` | `SubmissionsPage` | **protected** — redirects to `/login` without a token |
| `/login` | `LoginPage` | sets the token, then navigates away |
| `*` | `NotFoundPage` | catch-all, so no URL renders blank |

Every route is nested inside `Layout`, which owns the nav bar, the dark mode toggle, the
density control and the `<Outlet />` each page renders into. `ProtectedRoute` is a pathless
layout route: it guards what it wraps without adding a segment to the URL.

Auth is a typed Zustand store (`src/store/authStore.ts`) holding `token`, `userName`,
`login` and `logout`. It is in-memory only, so a full page reload signs you out.

## How to Install and Run

```bash
npm install
npm run dev
```

Then open the printed local URL (http://localhost:5173) in your browser.

To type-check and build for production:

```bash
npm run build
```
