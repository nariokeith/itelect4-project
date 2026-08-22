import type {
  ApiSubmission,
  ApiUser,
  Course,
  NewSubmission,
} from "../types/index";

// One place, one line to change when Session 9 swaps this for a real backend.
export const API_URL = "http://localhost:3001";

// fetch only rejects when the request never happened at all -- a 404 is a
// perfectly successful request that returned a 404. So every function below
// checks res.ok for itself.

// GET /courses  ->  the whole list
export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_URL}/courses`);
  if (!res.ok) {
    throw new Error("Could not load courses");
  }
  return res.json();
}

// GET /courses?code=ITELECT4  ->  an ARRAY of matches, not one course.
// Turning that list into a single course belongs here, not in the page.
export async function fetchCourseByCode(code: string): Promise<Course> {
  const res = await fetch(`${API_URL}/courses?code=${code}`);
  if (!res.ok) {
    throw new Error("Could not load that course");
  }
  const matches: Course[] = await res.json();
  if (matches.length === 0) {
    throw new Error(`No course is filed under the code "${code}".`);
  }
  return matches[0];
}

// GET /users  ->  the whole directory
export async function fetchUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) {
    throw new Error("Could not load people");
  }
  return res.json();
}

// GET /users/3  ->  one person. json-server answers 404 for an unknown id,
// which res.ok turns into the throw the page renders as "not found".
export async function fetchUserById(id: string): Promise<ApiUser> {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) {
    throw new Error(`No one is filed under the id "${id}".`);
  }
  return res.json();
}

// GET /submissions
export async function fetchSubmissions(): Promise<ApiSubmission[]> {
  const res = await fetch(`${API_URL}/submissions`);
  if (!res.ok) {
    throw new Error("Could not load submissions");
  }
  return res.json();
}

// POST /submissions  ->  the row the server saved, with the id it made
export async function createSubmission(
  newSubmission: NewSubmission
): Promise<ApiSubmission> {
  const res = await fetch(`${API_URL}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSubmission),
  });
  if (!res.ok) {
    throw new Error("Could not save the submission");
  }
  return res.json();
}
