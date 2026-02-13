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
  type BlockData,
  isBlockWithChildrenData,
  isConstantBlockData,
} from "../../../block-types.ts";
import { throwNull } from "../../../utils.ts";

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

interface ConversionError {
  type: "ConversionError";
  message: string;
}
interface ConversionSuccess {
  type: "ConversionSuccess";
  code: string;
  blocksEncountered: number;
}
type ConversionResult = ConversionSuccess | ConversionError;

function isConversionError(
  result: ConversionResult,
): result is ConversionError {
  return result.type === "ConversionError";
}
function convertBlocksToScamper(
  blocks: BlockContextType["blocks"],
  topLevel: BlockContextType["solutionTopLevel"],
): ConversionResult {
  const count = blocks.size;

  function scamperifyBlock(block: BlockData): ConversionResult {
    if (isConstantBlockData(block)) {
      return {
        type: "ConversionSuccess",
        code: block.value,
        blocksEncountered: 1,
      };
    }
    if (!isBlockWithChildrenData(block))
      return throwNull("block is neither constant nor block with children?");
    // else is block with children
    const childCode: string[] = [];
    let blocksEncountered = 1;
    for (const { id } of block.children) {
      if (!id) return { type: "ConversionError", message: "null child id" };
      const conversionResult = scamperifyBlock(
        blocks.get(id) ?? throwNull("child block id is not a real block?"),
      );
      if (isConversionError(conversionResult)) return conversionResult;
      childCode.push(conversionResult.code);
      blocksEncountered += conversionResult.blocksEncountered;
    }
    return {
      type: "ConversionSuccess",
      code: `(${childCode.join(" ")})`,
      blocksEncountered,
    };
  }

  let finalCode: string = "";
  let blocksEncountered = 0;
  for (const blockId of topLevel) {
    const block =
      blocks.get(blockId) ?? throwNull("top level block not found?");
    const conversionResult = scamperifyBlock(block);
    if (isConversionError(conversionResult)) return conversionResult;
    finalCode += conversionResult.code;
    blocksEncountered += conversionResult.blocksEncountered;
  }
  return blocksEncountered === count
    ? { type: "ConversionSuccess", code: finalCode, blocksEncountered }
    : {
        type: "ConversionError",
        message: `blocks encountered don't match count (${blocksEncountered.toString()} / ${count.toString()})`,
      };
}

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
      console.log(
        "conversion result: ",
        convertBlocksToScamper(
          current(draft).blocks,
          current(draft).solutionTopLevel,
        ),
      );
      return {
        ...draft,
        solutionIsCorrect: isEqual(current(draft).blocks, solutionBlocks),
      };
    }
  }
};
