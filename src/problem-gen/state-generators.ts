import type { BlockData } from "../common/providers/block/block-types.ts";
import { parseTemplateSolution, turnIntoBlock } from "./gen-utils.ts";
import { SectionTitles, throwNull } from "../common/utils.ts";

export function generateSolutionFromScamper(src: string) {
  const { nodes: queue } = parseTemplateSolution(src);

 
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
    const data = { ...block, parentId: SectionTitles.BlockLibrary };
    blockMap.set(id, data);
  }

  for (const [id, block] of blockMap) {
    if (block.type !== "BlockWithChildren") continue;
    const updatedChildren = block.children.map((childSlot) => {
  
      if (childSlot.id && !childSlot.locked) {
        const childData = blockMap.get(childSlot.id);
        if (childData) {
          childData.parentId = SectionTitles.BlockLibrary;
        }
  
        return { ...childSlot, id: null };
      }
      return childSlot;
    });

    const updatedBlock = { ...block, children: updatedChildren };
    blockMap.set(id, updatedBlock);
  }

  return blockMap;
}


export function createParsonsBlocks(templateSolution: string) {

  return generateInitialStateFromSolution(generateSolutionFromScamper(templateSolution));
}
