import { SectionTitles } from "../../utils.ts";
import {
  generateInitialStateFromSolution,
  generateSolutionFromScamper,
} from "../../../problem-gen/state-generators.ts";

export function generateInitialStateFromTemplate(templateSolution: string) {
  const solution = generateSolutionFromScamper(templateSolution);
  const blocks = generateInitialStateFromSolution(solution);

  // All blocks should now be in BlockLibrary, with empty children slots
  // This means there should be no top-level blocks in the solution box
  const solutionTopLevel: string[] = [];

  return {
    blocks,
    solutionTopLevel,
  };
}

export const initialState = generateInitialStateFromTemplate("(- `2 (reduce `+ (list 4 5)))");
