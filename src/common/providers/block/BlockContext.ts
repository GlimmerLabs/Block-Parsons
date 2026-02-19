import { createContext, useContext } from "react";
import type { BlockData } from "../../block-types.ts";

interface Solution {
  topLevel: readonly string[];
  isCorrect: boolean | null;
  code: string | null;
}
export interface BlockContextType {
  blocks: Map<string, BlockData>;
  solution: Solution;
}

export const BlockContext = createContext<BlockContextType | null>(null);

export function useBlockContext() {
  const context = useContext(BlockContext);
  if (!context) {
    throw new Error("useBlockContext must be used within a BlockContext");
  }
  return context;
}
