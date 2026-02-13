import type { BlockData } from "../common/block-types.ts";
import { parseTemplateSolution, turnIntoBlock } from "./gen-utils.ts";
import { SectionTitles, throwNull } from "../common/utils.ts";

export function generateSolutionFromScamper(src: string) {
  const { nodes: queue } = parseTemplateSolution(src);

  // console.log(queue);
  const solutionMap = new Map<string, BlockData>();

  for (const node of queue) {
    turnIntoBlock(node, solutionMap);
  }

  return solutionMap;
}

export function generateInitialStateFromSolution(
  solutionMap: Map<string, BlockData>,
) {
  const blockMap = new Map<string, BlockData>();

  for (const [id, block] of solutionMap) {
    const data = block;
    if (block.parentId === SectionTitles.SolutionBox) {
      data.parentId = SectionTitles.BlockLibrary;
    }
    blockMap.set(id, data);
  }

  for (const [, block] of blockMap) {
    if (block.type !== "BlockWithChildren") continue;
    for (const childSlot of block.children) {
      if (childSlot.locked || !childSlot.id) continue;
      const childData =
        blockMap.get(childSlot.id) ??
        throwNull("non-null slot id somehow points to non-existent block");
      childData.parentId = SectionTitles.BlockLibrary;
      childSlot.id = null;
    }
  }

  return blockMap;
}
