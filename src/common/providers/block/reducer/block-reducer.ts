import type { Active, Over } from "@dnd-kit/core";
import type { BlockContextType } from "../BlockContext.ts";
import type { Draft } from "immer";
import type { ImmerReducer } from "use-immer";
import { handleSetParent } from "./set-parent-handler.ts";
import { initialState } from "../initial-state.ts";

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
      type: "LOAD_PROBLEM";
      payload: BlockContextType;
    };

export const blockReducer: ImmerReducer<BlockContextType, BlockDispatchType> = (
  draft: Draft<BlockContextType>,
  action: BlockDispatchType,
) => {
  switch (action.type) {
    // TODO: add more cases, for now ignore eslint
    case "SET_PARENT": {
      handleSetParent(draft, action);
      // console.log(draft.solutionTopLevel);
      return;
    }
    case "RESET": {
      return initialState;
    }
    case "LOAD_PROBLEM": {
      return action.payload;
    }
  }
};
