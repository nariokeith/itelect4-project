import type {
  ApiSubmission,
  ApiUser,
  AuthReply,
  Course,
  NewSubmission,
} from "../types/index";
import useAuthStore from "../store/authStore";

// Vite only exposes variables that start with VITE_, and it replaces this at
// BUILD time -- whatever was in .env (or in Vercel's settings) when
// `npm run build` ran is baked into the bundle. Changing it in Vercel means
// nothing until the next deploy.
export const API_URL = import.meta.env.VITE_API_URL;

// A sentence now beats every call quietly going to "undefined/api/courses".
if (!API_URL) {
  throw new Error(
    "VITE_API_URL is missing. Copy .env.example to .env, fill it in, " +
      "and restart npm run dev."
  );
}

// Every call goes through here: the host, the JSON header, the token when
// there is one, and the API's own message when it refuses.
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // getState(), not the hook -- this is not a component. It only needs the
  // token as it is at the moment of the call.
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // The exact header requireAuth reads. No token means no header at all,
      // which is what the public course routes want.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // A token the API no longer accepts -- expired after two hours, or a
    // leftover demo-token from before this API existed. Persist would keep
    // handing it back forever, so drop it and the app is simply logged out.
    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
    }

    // Every refusal this API sends has a message field. Reading it is the
    // difference between "Request failed" and "repoUrl must start with
    // https://github.com/owner/repo".
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }

  // 204 No Content has no body to parse.
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ---- courses: public. request() sends no token, and none is needed.

export function fetchCourses(): Promise<Course[]> {
  return request<Course[]>("/api/courses");
}

// One course by code. A bad code answers 404 and request() throws the
// sentence the API sent -- no array to unwrap any more.
export function fetchCourseByCode(code: string): Promise<Course> {
  return request<Course>(`/api/courses/${encodeURIComponent(code)}`);
}

// ---- submissions: private. The token goes on automatically.

export function fetchSubmissions(): Promise<ApiSubmission[]> {
  return request<ApiSubmission[]>("/api/submissions");
}

export function createSubmission(
  newSubmission: NewSubmission
): Promise<ApiSubmission> {
  return request<ApiSubmission>("/api/submissions", {
    method: "POST",
    body: JSON.stringify(newSubmission),
  });
}

// ---- auth: the two routes that make a session exist

export function registerUser(body: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiUser> {
  return request<ApiUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function loginUser(body: {
  email: string;
  password: string;
}): Promise<AuthReply> {
  return request<AuthReply>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
