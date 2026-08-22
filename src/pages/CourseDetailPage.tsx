import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import type { ApiSubmission, Course } from "../types/index";
import CourseCard from "../components/CourseCard";
import { fetchCourseByCode, fetchSubmissions } from "../api/client";
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
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // GONE: const course = allCourses.find((c) => c.code === code);
  //
  // The code from the URL goes INTO the key, so /courses/CSSWENG and
  // /courses/ITELECT4 get one cache entry each instead of sharing one. Leave
  // `code` out and every course would quietly overwrite the last one.
  const {
    data: course,
    isPending,
    isError,
    error,
  } = useQuery<Course>({
    queryKey: ["courses", code],
    // An arrow function, because we need to pass an argument. Writing
    // queryFn: fetchCourseByCode would hand Query the function with no code
    // to give it. The ! is safe only because `enabled` is right below.
    queryFn: () => fetchCourseByCode(code!),
    enabled: code !== undefined,
  });

  // The same ["submissions"] entry SubmissionsPage uses. Two components, one
  // cache entry, one request -- not two.
  const { data: submissions } = useQuery<ApiSubmission[]>({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
  });

  if (isPending) {
    return (
      <div>
        <p className={sectionLabel}>loading record</p>
        <div className="mt-6 h-40 max-w-sm animate-pulse rounded-2xl border border-rule bg-white shadow-sm motion-reduce:animate-none dark:border-ink-line dark:bg-ink-raise" />
      </div>
    );
  }

  // REPLACES Session 6's `if (course === undefined)` block: a bad code makes
  // fetchCourseByCode throw, and the throw lands here instead.
  if (isError) {
    return (
      <div className={notFoundPanel}>
        <p className={notFoundLabel}>no such record</p>
        <h2 className={`mt-2 ${pageHeading}`}>Course not found</h2>
        <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
          {error.message}
        </p>
        <button
          onClick={() => navigate("/courses")}
          className={`${quietButton} mt-4`}
        >
          back to courses
        </button>
      </div>
    );
  }

  // submissions is undefined until its own query settles, so the counts show
  // zero for a moment rather than crashing.
  const courseSubmissions = (submissions ?? []).filter(
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
