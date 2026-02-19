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
          },
        };
      }
      const { code: solutionCode } = conversionResult;

      if (!isEqual(current(draft).blocks, solutionBlocks))
        console.log(current(draft).blocks, solutionBlocks);
      return {
        ...draft,
        solution: {
          ...current(draft).solution,
          isCorrect: isEqual(current(draft).blocks, solutionBlocks),
          code: solutionCode,
        },
      };
    }
  }
};
