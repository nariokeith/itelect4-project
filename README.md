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
| `/submissions` | `SubmissionsPage` | **protected** — redirects to `/login` without a token |
| `/login` | `LoginPage` | email + password, checked by the API (GT4 Part 2) |
| `/register` | `RegisterPage` | creates the account, then logs in (GT4 Part 2) |

`/people` and `/people/:id` were removed in GT4 Part 2: they read json-server's `/users`,
and the real API has no public list of users.
| `*` | `NotFoundPage` | catch-all, so no URL renders blank |

Every route is nested inside `Layout`, which owns the nav bar, the dark mode toggle, the
density control and the `<Outlet />` each page renders into. `ProtectedRoute` is a pathless
layout route: it guards what it wraps without adding a segment to the URL.

Auth is a typed Zustand store (`src/store/authStore.ts`) holding `token`, `userName`,
`setSession` and `logout`. Since GT3 Part 2 it is wrapped in `persist`, so a reload keeps
you signed in. Since GT4 Part 2 the token is a real JWT issued by the API.

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

Values that only one component reads stay local. Since GT3 Part 3 the Submissions form's
two fields are not even `useState` any more — React Hook Form holds them (see below) — but
the principle is the same: they never leave that page, so they never belonged in a store.
`LoginPage` still uses `useState`, deliberately.

### The API

> Replaced in GT4 Part 2 — json-server and `db.json` are gone. See below.

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

## Forms and Components (GT3 Part 3)

### The schema is the single source of truth

`src/schemas/submissionSchema.ts` is the only file in the app that knows what a valid
submission looks like. It holds **four rules across two fields**, two of them written with
`.refine()` — rules Zod does not ship:

| Field | Rule | Message |
|---|---|---|
| `courseCode` | `.min(1)` | `Choose a course.` |
| `repoUrl` | `z.url()` | `That is not a valid URL -- include https://` |
| `repoUrl` | `.refine()` — host must be GitHub | `It has to be a GitHub URL.` |
| `repoUrl` | `.refine()` — owner/repo, not a bare profile | `Point at a repository, not a profile -- github.com/owner/repo.` |

Both `.refine()` rules are about **this app's data**: it tracks GitHub repository
submissions, so the host and the `owner/repo` shape are part of what a `repoUrl` means.
`https://github.com/nariokeith` is a valid URL and a real GitHub page, and still not
something a marker can clone.

The form's TypeScript type is **derived, never hand-written**:

```ts
export type SubmissionFormValues = z.infer<typeof submissionSchema>;
// -> { courseCode: string; repoUrl: string }
```

`typeof` there is the type-level `typeof`: `z.infer` wants a type and `submissionSchema` is
a value. Add a field to the schema and the type gains it in the same keystroke, so the
rules and the type cannot drift apart.

### React Hook Form, and the resolver between them

`SubmissionsPage` lost its `useState` pair. One `useForm` call replaced both:

```ts
const { register, handleSubmit, reset, formState: { errors } } =
  useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),   // the adapter
    mode: "onBlur",                            // check a field when you leave it
    defaultValues: { courseCode: "", repoUrl: "" },
  });
```

React Hook Form has never heard of Zod and Zod has never heard of React; `zodResolver` is
the only thing that knows about both, and it is imported from `@hookform/resolvers/zod` —
the package root gives you nothing.

`register("repoUrl")` spreads `name`, `onChange`, `onBlur` and `ref` onto an element, so
the value lives in the DOM node rather than in React state and a keystroke no longer
re-renders the page. It works unchanged on the native `<select>`, which is why there is no
`<Select>` component to install for the course dropdown.

`<form onSubmit={handleSubmit(onSubmit)}>` is the gate. There is no `if` deciding whether
to save: `handleSubmit` runs the resolver first and calls `onSubmit` only if every rule
passed. **Submitting an invalid form fires zero network requests** — verified in the
Network tab, which stays empty while both error messages render.

The write path itself is untouched from GT3 Part 2. `onSubmit` still calls the same
`addSubmission.mutate(...)`, and `onSuccess` still calls
`invalidateQueries({ queryKey: ["submissions"] })`. The one addition is `reset()` beside
it, so both fields clear **after** the row is really saved — one call instead of one setter
per field, and `defaultValues` is what it puts back.

### Errors on screen

Each field renders its own message, guarded by `&&` because `errors.repoUrl` only exists
while that field is broken:

```tsx
{errors.repoUrl && <p className="text-sm text-late dark:text-late-lift">{errors.repoUrl.message}</p>}
```

`aria-invalid={errors.repoUrl ? true : undefined}` — `undefined`, not `false`, so the
attribute disappears entirely when the field is valid. A screen reader reads it, and
`input.tsx` styles its red border off the same attribute, so what is seen and what is heard
cannot disagree. One message shows per **field**, not per rule: `repoUrl` has three rules,
so fixing one can reveal the next.

The submit button is never disabled on "invalid" — clicking it is what reveals the
messages, and with `mode: "onBlur"` a disabled button would also need two clicks (the first
only blurs the field). Only a save already in flight disables it.

### Shadcn UI — owned, not installed

`npx shadcn@latest init` (Base UI / Nova) wrote `components.json` and `src/lib/utils.ts`;
`npx shadcn@latest add button input label` wrote three files into `src/components/ui/`.
Those are **source code, not a dependency**: they live in `src/`, they are committed, and
`npm install` does not touch them. `src/components/ui/`, `src/lib/utils.ts` and
`components.json` must all be in the repo or a clone will not compile.

In use on three pages:

| Page | Components |
|---|---|
| `SubmissionsPage` | `Label`, `Input`, `Button` (+ a native `<select>` styled to match) |
| `LoginPage` | `Label`, `Input`, `Button` |
| `CoursesPage` | `Input` (the search box) |

`LoginPage` keeps `useState` and has no schema on purpose: one field with one rule does not
need `useForm`, Zod or a resolver. The component set and the form library are independent —
either works without the other.

`cn()` in `src/lib/utils.ts` runs a component's own classes and yours through `twMerge`, so
a `className` passed in **wins** instead of fighting the one already inside. `button.tsx`
uses `cva` to turn a `variant` prop into a class string; the six variant names are written
out in full in that file, which is both how Tailwind's scanner sees them and the only
documentation of them that cannot go out of date.

### The `@/` alias

`@/components/ui/button` resolves to `src/components/ui/button.tsx`. Two tools need telling
separately, and neither reads the other's setting:

- **TypeScript** — `"paths": { "@/*": ["./src/*"] }` in **both** `tsconfig.json` and
  `tsconfig.app.json`. Deliberately **no `baseUrl`**: the shadcn docs still tell you to add
  one, and TypeScript 6 answers `error TS5101: Option 'baseUrl' is deprecated` — at
  `npm run build` only, never at `npm run dev`.
- **Vite** — `resolve.alias` in `vite.config.ts`, using `import.meta.dirname` rather than
  the docs' `__dirname`, because `vite.config.ts` is an ES module and Vite 8 warns about
  `__dirname`.

Add the alias to only one of them and it fails in the other half: the editor is happy while
the browser 500s, or the reverse.

### Theme: shadcn's tokens on this project's palette

`shadcn init` appends its own token layer to `src/index.css`. The design system from
Session 5 (`--color-ink`, `--color-paper`, `--color-rule`, `--color-late`, the fonts and the
shadows) is untouched above it, and **every** shadcn variable underneath is repointed at
those existing colours — `--primary: var(--color-ink)`, `--border: var(--color-rule)`,
`--destructive: var(--color-late)`, and their inverses under `.dark`. Two edits to the
generated block were needed: the Nova preset set `--font-sans: 'Geist Variable'`, which
sat after this project's `@theme` and quietly replaced IBM Plex Sans everywhere, and
`--radius` is set to `0.375rem` so shadcn's `rounded-lg` matches the `rounded-md` every
hand-styled control already used.

The payoff is `text-foreground` on the `<Label>`s: `index.css` defines `--foreground` twice,
once under `:root` and once under `.dark`, so one class covers both themes with no `dark:`
partner. The rest of the app still uses Session 5's `text-ink dark:text-paper` pairs, which
is fine — both compile to CSS, and one `.dark` class on Layout's wrapper switches both
systems at once.

### Seed data now passes its own schema

The five seeded `repoUrl`s in `db.json` were bare `github.com/...` strings — values the
form itself would now refuse to create. All five gained `https://`, so the list no longer
renders rows that fail the rules it is read by.

## Full Stack and Deployment (GT4 Part 2)

The app now reads and writes through
[itelect4-backend](https://github.com/nariokeith/itelect4-backend), an Express + MongoDB
API. Both are deployed on Vercel:

| | URL |
|---|---|
| Frontend | https://itelect4-project-eta.vercel.app |
| Backend | https://itelect4-backend-zeta.vercel.app |

- **One `request()` helper** in `src/api/client.ts` holds the host (`VITE_API_URL`), the
  JSON header, the `Authorization: Bearer <token>` header whenever a token exists, and the
  API's own error message on failure. A 401 while holding a token logs the user out, so an
  expired or leftover token cannot get stuck.
- **Courses are public** (`GET /api/courses`, `GET /api/courses/:code`); **submissions are
  private** and belong to the logged-in account. Their query key includes the token, so one
  account never sees another's cached rows.
- **The derived types match the API**: `NewSubmission` is just `courseCode` + `repoUrl`. The
  server sets `studentId` from the token and `submittedAt` from its schema default.
- **Login and register** use React Hook Form + Zod (`src/schemas/authSchema.ts`). Register
  calls `/api/auth/register` then `/api/auth/login`, because only login issues a token.
- **`vercel.json`** rewrites every path to `index.html`, so a refresh on `/submissions`
  does not 404.

## How to Install and Run

```bash
npm install
cp .env.example .env   # then set VITE_API_URL
```

`VITE_API_URL` is the API's address with no trailing slash and no `/api` — either
`http://localhost:4000` with itelect4-backend running locally (`npm run dev` there), or the
deployed backend URL above. Then:

```bash
npm run dev            # the app on http://localhost:5173
```

Vite reads `VITE_API_URL` when it starts and bakes it into a build, so restart `npm run dev`
(or redeploy) after changing it.

To type-check and build for production:

```bash
npm run build
```
