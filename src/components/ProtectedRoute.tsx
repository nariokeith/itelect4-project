// src/components/ProtectedRoute.tsx
// Renders no UI of its own -- it only decides. One question, two answers.
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  // No token? Send them to the login page instead of the page they asked for.
  //
  // `replace` overwrites the current history entry instead of adding one.
  // Without it, Back from /login returns to /submissions, which redirects
  // straight here again -- and the Back button appears frozen.
  if (token === null) {
    return <Navigate to="/login" replace />;
  }

  // There IS a token, so render whichever child route matched.
  return <Outlet />;
}

export default ProtectedRoute;

// Notice: this component has NO path of its own. It is a pathless layout
// route, exactly like Layout -- it wraps the routes it guards without adding
// a single segment to the URL.
