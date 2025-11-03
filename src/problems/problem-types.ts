export interface Problem {
  id: string;
  topicId: string;
  title: string;
  description: string;
  templateSolution: string;
  expectedOutput?: string;
  week: number;
  difficulty: "easy" | "medium" | "hard";
  hints?: string[];
  distractors?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  week: number;
  problems: Problem[];
}

export const DifficultyColors = {
  easy: "#28a745", // green
  medium: "#ffc107", // yellow
  hard: "#dc3545", // red
} as const;

