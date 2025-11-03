import { MainContent } from "./MainContent.tsx";
import { ProblemSelector } from "./ProblemSelector.tsx";
import { BlockProvider } from "../common/providers/block/BlockProvider.tsx";
import { DndProvider } from "../common/providers/drag-and-drop/DndProvider.tsx";
import { ProblemProvider, useProblemContext } from "./ProblemContext.tsx";
import { useState } from "react";

function AppContent() {
  const { setCurrentProblem } = useProblemContext();
  const [showProblem, setShowProblem] = useState(false);

  const handleSelectProblem = (problemId: string) => {
    setCurrentProblem(problemId);
    setShowProblem(true);
  };

  const handleBackToProblems = () => {
    setShowProblem(false);
  };

  return showProblem ? (
    <>
      <button
        onClick={handleBackToProblems}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Back to Problems
      </button>
      <MainContent />
    </>
  ) : (
    <ProblemSelector onSelectProblem={handleSelectProblem} />
  );
}

export function App() {
  return (
    <ProblemProvider>
      <BlockProvider>
        <DndProvider>
          <AppContent />
        </DndProvider>
      </BlockProvider>
    </ProblemProvider>
  );
}
