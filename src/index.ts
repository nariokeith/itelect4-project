import type { User, Course, Submission } from "./types/index";
import type { StringOrNumber } from "./types/index";
import type {
  ApiResponse,
  UserUpdate,
  UserPreview,
  PublicUser,
  RoleCount,
} from "./types/index";
import { SubmissionStatus, Role } from "./types/index";
const projectName: string = "itelect4-project";
const currentYear: number = 2026;
const isFullStack: boolean = true;
const nothing: null = null;
const notSet: undefined = undefined;
function greet(name: string, year: number): string {
  return `Welcome to ${name} -- AY ${year}!`;
}
function logMessage(message: string): void {
  console.log(message);
}
logMessage(greet(projectName, currentYear));

let anything: any = "hello";
anything = 42;
anything = true;
let userInput: unknown = "test";
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase());
}
function throwError(message: string): never {
  throw new Error(message);
}

const student: User = {
  id: 1,
  name: "Juan dela Cruz",
  email: "juan@example.com",
  role: "student",
  isActive: true,
};
const course: Course = {
  code: "ITELECT4",
  title: "IT Elective 4",
  units: 3,
  semester: "1st Semester 2026-2027",
};

console.log(student);
console.log(course);

function processInput(input: StringOrNumber): string {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  return input.toFixed(2);
}
function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return value;
}
console.log(processInput("hello"));
console.log(processInput(3.14159));
console.log(formatDate(new Date()));

function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}
function getById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}
const firstUser = getFirst<User>([student]);
const foundUser = getById<User>([student], 1);

console.log(firstUser?.name);
console.log(foundUser?.email);

const userResponse: ApiResponse<User> = {
  success: true,
  data: student,
};

const courseResponse: ApiResponse<Course[]> = {
  success: true,
  data: [course],
};

console.log(userResponse.data.name);

const patch: UserUpdate = { name: "Juan D. Cruz" };

const preview: UserPreview = { id: 1, name: "Juan dela Cruz", role: "student" };

const publicProfile: PublicUser = { id: 1, name: "Juan dela Cruz", role: "student" };

const roleCount: RoleCount = { student: 45, admin: 2, instructor: 3 };

function makeSubmission(courseCode: string) {
  return { id: 1, studentId: 1, courseCode, submittedAt: new Date() };
}

type NewSubmission = ReturnType<typeof makeSubmission>;
const gt1Submission: NewSubmission = makeSubmission("ITELECT4");

let status: SubmissionStatus = SubmissionStatus.Pending;
console.log(SubmissionStatus[status]);

status = SubmissionStatus.Graded;
console.log(status === SubmissionStatus.Graded);

const currentRole: Role = Role.Student;
console.log(currentRole);
