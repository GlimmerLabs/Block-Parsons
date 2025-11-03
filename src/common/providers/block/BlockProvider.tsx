import { type PropsWithChildren, useEffect } from "react";
import { BlockContext, type BlockContextType } from "./BlockContext.ts";
import { BlockDispatchContext } from "./BlockDispatchContext.ts";
import { initialState, generateInitialStateFromTemplate } from "./initial-state.ts";
import { useImmerReducer } from "use-immer";
import {
  type BlockDispatchType,
  blockReducer,
} from "./reducer/block-reducer.ts";
import { useProblemContext } from "../../../app/ProblemContext.tsx";

export function BlockProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useImmerReducer<
    BlockContextType,
    BlockDispatchType
  >(blockReducer, initialState);
  
  const { currentProblem } = useProblemContext();
  
  // Reload blocks when problem changes
  useEffect(() => {
    if (currentProblem) {
      const newState = generateInitialStateFromTemplate(currentProblem.templateSolution);
      dispatch({ type: "LOAD_PROBLEM", payload: newState });
    }
  }, [currentProblem?.id, dispatch]);

  return (
    <BlockContext.Provider value={state}>
      <BlockDispatchContext.Provider value={dispatch}>
        {children}
      </BlockDispatchContext.Provider>
    </BlockContext.Provider>
  );
}
