import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import ReviewPage from "./pages/ReviewPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />

        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:code" element={<CourseDetailPage />} />

        <Route path="login" element={<LoginPage />} />
        {/* Public, like login: you cannot be logged in yet. */}
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="submissions" element={<SubmissionsPage />} />
          {/* Behind the same guard: the API refuses it without a token
              anyway, so the page should not offer it. */}
          <Route path="review" element={<ReviewPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
