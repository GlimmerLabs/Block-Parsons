import { SectionTitles } from "../common/utils.ts";

import {
  generateInitialStateFromSolution,
  generateSolutionFromTemplate,
} from "./state-generators.ts";
import type { BlockContextType } from "../common/providers/block/BlockContext.ts";

const template = "^(define double (lambda (n) (reduce + (list n n))))";
const solution = generateSolutionFromTemplate(template);
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
    code: null,
  },
};
