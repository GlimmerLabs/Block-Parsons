import type { Topic } from "./problem-types.ts";

export const topics: Topic[] = [
  {
    id: "week1",
    name: "Syntax and Expressions",
    week: 1,
    problems: [
      {
        id: "problem1",
        topicId: "week1",
        title: "Simple Arithmetic Expression",
        description: "Construct a Scheme expression that computes the same value as 3 × (5 − 2 + 1)",
        templateSolution: "(* 3 (+ (- 5 2) 1))",
        expectedOutput: "12",
        week: 1,
        difficulty: "easy",
        hints: ["Remember Scheme uses prefix notation", "Start with the outermost operation"],
      },
      {
        id: "problem2",
        topicId: "week1",
        title: "Arithmetic with Nested Operations",
        description: "Build the expression (+ (- (* 3 5) (/ 20 2)) (- (+ 2 8) 6))",
        templateSolution: "(+ (- (* 3 5) (/ 20 2)) (- (+ 2 8) 6))",
        expectedOutput: "6",
        week: 1,
        difficulty: "medium",
        hints: ["Work from the innermost expressions out", "Remember the order of operations"],
      },
    ],
  },
  {
    id: "week2",
    name: "Beyond Arithmetic",
    week: 2,
    problems: [
      {
        id: "problem3",
        topicId: "week2",
        title: "Drawing Expression",
        description: "Create a blue circle with radius 60 using solid-circle",
        templateSolution: '(solid-circle 60 "blue")',
        expectedOutput: "#<image>",
        week: 2,
        difficulty: "easy",
        hints: ["The first argument is the radius", "The second argument is the color as a string"],
      },
    ],
  },
];

export function getProblemById(problemId: string) {
  for (const topic of topics) {
    const problem = topic.problems.find((p) => p.id === problemId);
    if (problem) return problem;
  }
  return null;
}

export function getTopicById(topicId: string) {
  return topics.find((t) => t.id === topicId) || null;
}

