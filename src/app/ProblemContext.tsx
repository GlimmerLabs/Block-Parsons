import { createContext, useContext, useState } from "react";
import type { Problem } from "../problems/problem-types.ts";
import { getProblemById } from "../problems/index.ts";

interface ProblemContextType {
  currentProblem: Problem | null;
  setCurrentProblem: (problemId: string) => void;
}

const ProblemContext = createContext<ProblemContextType | null>(null);

export function useProblemContext() {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error("useProblemContext must be used within a ProblemProvider");
  }
  return context;
}

interface ProblemProviderProps {
  children: React.ReactNode;
}

export function ProblemProvider({ children }: ProblemProviderProps) {
  const [currentProblem, setCurrentProblemState] = useState<Problem | null>(null);

  const setCurrentProblem = (problemId: string) => {
    const problem = getProblemById(problemId);
    setCurrentProblemState(problem);
  };

  return (
    <ProblemContext.Provider value={{ currentProblem, setCurrentProblem }}>
      {children}
    </ProblemContext.Provider>
  );
}

