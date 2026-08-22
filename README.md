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
`login` and `logout`. Since GT3 Part 2 it is wrapped in `persist`, so a reload keeps
you signed in.

## State and Data Fetching (GT3 Part 2)

### Two stores, split by question

| Store | Answers | localStorage key | What `partialize` saves |
|---|---|---|---|
| `src/store/authStore.ts` | "who is logged in" | `itelect4-auth` | `token`, `userName` |
| `src/store/uiStore.ts` | "how does the app look" | `itelect4-ui` | `isDarkMode`, `isCompact` |

`uiStore` also holds `searchTerm`, which is deliberately **not** persisted — a search box
still full of last week's text after a reload would only confuse people. Dark mode and the
density pill moved out of `Layout` into the store, which is why `LayoutContext` and the
`useOutletContext` call in `CoursesPage` are gone. `useToggle` survives: `DashboardPage`
still uses it for `showDetails`.

Values that only one component reads stay in `useState` — the repo-URL box and the course
`<select>` on the Submissions page never leave that page.

### The API

`db.json` in the project **root** (not `src/`) is served by json-server. It is committed
to git — the app has nothing to show without it.

```bash
npm run api    # terminal 1 -- http://localhost:3001, must stay running
npm run dev    # terminal 2 -- http://localhost:5173
```

Three collections: `/courses`, `/submissions`, `/users`.

`src/api/client.ts` owns **every** `fetch` in the app. No component calls `fetch` directly,
so swapping `API_URL` for a real backend later is a one-line change. Each function checks
`res.ok` itself, because `fetch` does not throw on a 404.

### API types

json-server rewrites every `id` as a string, and JSON has no `Date`. The shapes on the wire
are therefore not the ones declared in Sessions 1–2, so `src/types/index.ts` derives them
with `Omit` rather than duplicating them:

```ts
type ApiUser       = Omit<User, "id"> & { id: string };
type ApiSubmission = Omit<Submission, "id" | "studentId" | "submittedAt">
                     & { id: string; studentId: string; submittedAt: string };
type NewSubmission = Omit<ApiSubmission, "id">;
```

`studentId` is redeclared as a string so it still matches `ApiUser["id"]` — left as a
number, that `===` would silently never match. `SubmissionBadge` and `UserCard` take the
`Api*` types, and the badge parses `submittedAt` with `new Date(...)` before formatting it,
because it is a string over the wire.

### Queries and the mutation

One `QueryClient` is created in `src/main.tsx`, outside the component tree.

| Page | Query keys |
|---|---|
| `CoursesPage` | `["courses"]` |
| `CourseDetailPage` | `["courses", code]` (from the URL) + `["submissions"]` |
| `PeoplePage` | `["users"]` |
| `PersonDetailPage` | `["users", id]` (from the URL) + `["submissions"]` |
| `DashboardPage` | `["courses"]`, `["submissions"]`, `["users"]` |
| `SubmissionsPage` | `["submissions"]`, `["users"]`, `["courses"]` |

Pages sharing a key share one cache entry and one request. The detail pages put the URL
value **into** the key, so `/courses/CS101` and `/courses/ITELECT4` get an entry each
instead of overwriting one another.

`SubmissionsPage` holds the one `useMutation`: it POSTs through `createSubmission` and
calls `invalidateQueries({ queryKey: ["submissions"] })` in `onSuccess`, so the list
refreshes itself without a manual refetch and without a page reload.

`src/data/mockData.ts` is **deleted** — every page that used it now fetches instead.

### One local gotcha

`vite.config.ts` tells Vite's watcher to ignore `db.json`. Every POST makes json-server
rewrite that file, and without the ignore Vite would see the change and full-reload the
page — which wipes the form and hides whether `invalidateQueries` actually did anything.

## How to Install and Run

```bash
npm install
```

This app needs **two terminals**, and both must stay running:

```bash
npm run api    # terminal 1 -- the API on http://localhost:3001
npm run dev    # terminal 2 -- the app on http://localhost:5173
```

Then open http://localhost:5173 in your browser. Without `npm run api`, every page that
loads data shows its red "is json-server running on port 3001?" panel.

To type-check and build for production:

```bash
npm run build
```
