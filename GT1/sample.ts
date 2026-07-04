// sample.js -- provided for GT1 Part 1
// Task: convert to TS (rename sample.ts). Annotate all vars, params, return types
function getUser(id) {
return {
id: id,
name: "Juan dela Cruz",
email: "juan@example.com",
role: "student",
isActive: true,
score: 95.5,
};
}
function calculateGrade(score, maxScore) {
const percentage = (score / maxScore) * 100;
if (percentage >= 90) return "A";
if (percentage >= 80) return "B";
if (percentage >= 70) return "C";
return "F";
}
function formatCourse(name, units, semester) {
return `${name} (${units} units) - ${semester}`;
}
const user = getUser(1);
console.log(user);
console.log(calculateGrade(85, 100));
console.log(formatCourse("IT Elective 4", 3, "1st Semester"));