// src/App.tsx
// The only place in the codebase that knows the URL map. To find out what
// pages exist, you read this one file -- there is no UI here at all.
import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import PeoplePage from "./pages/PeoplePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* Every route lives inside Layout, so the nav bar is on every page --
          including the 404. The children sit INSIDE the parent's tags, which
          is why this Route does not self-close. */}
      <Route path="/" element={<Layout />}>
        {/* `index` is what you write instead of path="": the default child,
            shown at the parent's own URL. */}
        <Route index element={<DashboardPage />} />

        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:code" element={<CourseDetailPage />} />

        <Route path="people" element={<PeoplePage />} />
        <Route path="people/:id" element={<PersonDetailPage />} />

        <Route path="login" element={<LoginPage />} />

        {/* A pathless layout route: it adds a guard to everything nested
            inside it without adding a single segment to the URL. */}
        <Route element={<ProtectedRoute />}>
          <Route path="submissions" element={<SubmissionsPage />} />
        </Route>

        {/* The catch-all. Order does not decide the winner -- React Router
            scores routes by specificity, so "*" loses to every real path no
            matter where it is written. Last is a readability convention. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
