import type { Active, Over } from "@dnd-kit/core";
import type { BlockContextType } from "../BlockContext.ts";
import { current, type Draft } from "immer";
import type { ImmerReducer } from "use-immer";
import { handleSetParent } from "./set-parent-handler.ts";
import {
  initialState,
  solutionBlocks,
} from "../../../../problem-gen/initial-state.ts";
import { isEqual } from "es-toolkit";
import {
  convertBlocksToScamper,
  isConversionError,
} from "../../../../problem-gen/gen-utils.ts";

export type BlockDispatchType =
  | {
    type: "SET_PARENT";
    payload: {
      id: string;
      parentId: string;
      dndInfo: { active: Active | null; over: Over | null };
    };
  }
  | {
    type: "RESET";
  }
  | {
    type: "CHECK";
  };

export const blockReducer: ImmerReducer<BlockContextType, BlockDispatchType> = (
  draft: Draft<BlockContextType>,
  action: BlockDispatchType,
) => {
  switch (action.type) {
    case "SET_PARENT": {
      handleSetParent(draft, action);
      // console.log(draft.solutionTopLevel);
      return;
    }
    case "RESET": {
      return initialState;
    }
    case "CHECK": {
      // TODO: make not naive solution checking (probably relies on Scamper integration)
      const conversionResult = convertBlocksToScamper(
        current(draft).blocks,
        current(draft).solution.topLevel,
      );
      if (isConversionError(conversionResult)) {
        return {
          ...draft,
          solution: {
            ...current(draft).solution,
            isCorrect: false,
            isComplete: false,
            code: null,
            errorMessage: conversionResult.message,
          },
        };
      }
      const { code: solutionCode } = conversionResult;
      console.log(solutionCode);

      const isCorrect = isEqual(current(draft).blocks, solutionBlocks);
      return {
        ...draft,
        solution: {
          ...current(draft).solution,
          isCorrect,
          isComplete: true,
          code: solutionCode,
          errorMessage: isCorrect ? null : "The solution is incorrect. Try again!",
        },
      };
    }
  }
};
