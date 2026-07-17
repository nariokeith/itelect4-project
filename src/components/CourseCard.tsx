// src/components/CourseCard.tsx
import type { Course } from "../types/index";

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="course-card">
      <h3>{course.code}</h3>
      <p>{course.title}</p>
      <p>{course.units} units -- {course.semester}</p>
    </div>
  );
}

export default CourseCard;
