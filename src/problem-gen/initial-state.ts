import { SectionTitles } from "../common/utils.ts";
import templateSolution from "./template-solution.ppsol?raw";
import {
  generateInitialStateFromSolution,
  generateSolutionFromTemplate,
} from "./state-generators.ts";
import type { BlockContextType } from "../common/providers/block/BlockContext.ts";

const solution = generateSolutionFromTemplate(templateSolution);
export const solutionBlocks = structuredClone(solution);
const blocks = generateInitialStateFromSolution(solution);

const solutionTopLevel = [...blocks.keys()].filter(
  (key) => blocks.get(key)?.parentId === SectionTitles.SolutionBox,
);

export const initialState: BlockContextType = {
  blocks,
  solution: {
    topLevel: solutionTopLevel,
    isCorrect: null,
    isComplete: null,
    errorMessage: null,
    code: null,
  },
};
