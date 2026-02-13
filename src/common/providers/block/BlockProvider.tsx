import { type PropsWithChildren } from "react";
import { BlockContext, type BlockContextType } from "./BlockContext.ts";
import { BlockDispatchContext } from "./BlockDispatchContext.ts";
import { initialState } from "../../../problem-gen/initial-state.ts";
import { useImmerReducer } from "use-immer";
import {
  type BlockDispatchType,
  blockReducer,
} from "./reducer/block-reducer.ts";

export function BlockProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useImmerReducer<
    BlockContextType,
    BlockDispatchType
  >(blockReducer, initialState);

  // console.log(blockMap);

  return (
    <BlockContext.Provider value={state}>
      <BlockDispatchContext.Provider value={dispatch}>
        {children}
      </BlockDispatchContext.Provider>
    </BlockContext.Provider>
  );
}
