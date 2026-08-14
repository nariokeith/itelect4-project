// src/pages/CourseDetailPage.tsx
// The page behind /courses/:code -- it reads which course to show out of the
// URL itself, so the address bar is what selects the record.
import { useNavigate, useParams } from "react-router";
import CourseCard from "../components/CourseCard";
import { allCourses, allSubmissions } from "../data/mockData";
import {
  chromePanel,
  notFoundLabel,
  notFoundPanel,
  pageHeading,
  quietButton,
  sectionCount,
  sectionLabel,
} from "../styles/ui";

function CourseDetailPage() {
  // Reads whatever is in the :code slot of the URL. The name `code` must
  // match the :code in App.tsx's path exactly -- spell it differently and
  // you get undefined, silently, with no error to tell you why.
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // Turn that string into a real Course object
  const course = allCourses.find((c) => c.code === code);

  // The URL is user input -- anyone can type anything into it. `code` is
  // string | undefined even though we typed the generic, because TypeScript
  // cannot promise the URL contains anything. This check is required, not
  // politeness.
  if (course === undefined) {
    return (
      <div className={notFoundPanel}>
        <p className={notFoundLabel}>no such record</p>
        <h2 className={`mt-2 ${pageHeading}`}>Course not found</h2>
        <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
          No course is filed under the code{" "}
          <span className="font-mono text-ink dark:text-paper">{code}</span>.
        </p>
        {/* useNavigate() returns a function you call from inside an event
            handler. Never call it in the component body -- it would run on
            every render and loop forever. */}
        <button
          onClick={() => navigate("/courses")}
          className={`${quietButton} mt-4`}
        >
          back to courses
        </button>
      </div>
    );
  }

  const courseSubmissions = allSubmissions.filter(
    (s) => s.courseCode === course.code
  );
  const gradedCount = courseSubmissions.filter(
    (s) => s.score !== undefined
  ).length;

  return (
    <div>
      <p className={sectionLabel}>course</p>
      <h2 className={`mt-2 ${pageHeading}`}>{course.title}</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <CourseCard course={course} />
        </div>

        <dl className={`self-start rounded-2xl p-6 ${chromePanel}`}>
          <div className="flex items-baseline justify-between gap-4">
            <dt className={sectionLabel}>code</dt>
            <dd className={sectionCount}>{course.code}</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-rule pt-3 dark:border-ink-line">
            <dt className={sectionLabel}>units</dt>
            <dd className={sectionCount}>{course.units}</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-rule pt-3 dark:border-ink-line">
            <dt className={sectionLabel}>semester</dt>
            <dd className={sectionCount}>{course.semester}</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-rule pt-3 dark:border-ink-line">
            <dt className={sectionLabel}>submissions</dt>
            <dd className={sectionCount}>
              {courseSubmissions.length}
              <span className="text-graphite dark:text-graphite-lift">
                {" "}
                · {gradedCount} graded
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={() => navigate("/courses")}
        className={`${quietButton} mt-6`}
      >
        back to courses
      </button>
    </div>
  );
}

export default CourseDetailPage;
