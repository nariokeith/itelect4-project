import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userName: string | null;
  // Two values in, nothing invented. The login page gets them from the API
  // and hands them here.
  setSession: (token: string, userName: string) => void;
  logout: () => void;
}

// This file deliberately does not import ../api/client. client.ts reads the
// token out of this store on every request, so a store that called client.ts
// back would be an import loop.
//
// create<AuthState>()( persist(...) ) -- note the extra (). Without middleware
// this was create<AuthState>((set) => ...); with middleware TypeScript needs
// that empty call first or the generic stops working.
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      setSession: (token, userName) => set({ token, userName }),
      logout: () => set({ token: null, userName: null }),
    }),
    {
      name: "itelect4-auth", // the localStorage key it writes to
      partialize: (state) => ({
        // save ONLY these two fields. Functions cannot become JSON, so without
        // partialize setSession and logout would silently vanish instead of
        // being left out on purpose.
        token: state.token,
        userName: state.userName,
      }),
    }
  )
);

// The token is a real JWT now, good for two hours (expiresIn in the backend's
// login route). localStorage is readable by any script on the page, so a
// cross-site scripting hole would expose it; an httpOnly cookie is the
// production answer. Persist can also bring back a token the API has stopped
// accepting -- the next request answers 401, and logging out and in fixes it.

export default useAuthStore;
