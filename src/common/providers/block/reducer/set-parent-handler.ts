import type { BlockContextType } from "../BlockContext.ts";
import { ArgumentSlotPrefix } from "../../../../components/block/ArgumentSlot.tsx";
import { SectionTitles, throwNull } from "../../../utils.ts";
import type { Active, Over } from "@dnd-kit/core";
import type { BlockDispatchType } from "./block-reducer.ts";
import type { Draft } from "immer";
import { type BlockData, isBlockWithChildren } from "../../../block-types.ts";

export function handleSetParent(
  draft: Draft<BlockContextType>,
  action: BlockDispatchType,
): void {
  const blocks = draft.blocks;
  const solutionTopLevel: Draft<string[]> = draft.solutionTopLevel;
  if (action.type !== "SET_PARENT") {
    throw new Error("expected SET_PARENT action");
  }
  const {
    id,
    parentId,
    dndInfo: { active, over },
  } = action.payload;
  // console.log(id, parentId);

  const child = blocks.get(id);
  if (!child) {
    throw new Error(`attempted to set parent of unknown block ${id}`);
  }
  const originalParentId = child.parentId;

  const [prefix, ...suffix] = parentId.split(":");

  // remove child from original parent's child blocks
  const originalIndex = removeChildFromParent(child, blocks, id);
  // remove child from solution top level if exists
  const { originalTopLevelIndex, updatedTopLevel } = removeChildFromTopLevel(
    solutionTopLevel,
    id,
  );

  // set new parent
  if (!prefix.startsWith(ArgumentSlotPrefix)) {
    // new parent is top level
    const newTopLevel = setTopLevelParent(
      prefix,
      blocks,
      id,
      updatedTopLevel,
      active,
      over,
    );
    // console.log("new top level", newTopLevel);
    draft.solutionTopLevel = [...newTopLevel];
    return;
  }

  const [newParentId, parsedSlotIndex] = suffix;
  const slotIndex = Number(parsedSlotIndex);
  // check for invalid swap first
  const newParent = blocks.get(newParentId);
  if (!newParent || !parsedSlotIndex || !isBlockWithChildren(newParent)) {
    throw new Error("new parent not found or has no children?");
  }
  const parentChildren = newParent.children;
  const tempId = parentChildren[slotIndex].id;
  if (tempId === originalParentId) {
    // don't allow swap with original parent
    // console.warn("ignoring attempted swap with original parent");
    return;
  }
  child.parentId = newParentId;
  // potential swap
  parentChildren[slotIndex].id = id;
  if (!tempId) {
    // no swap required
    draft.solutionTopLevel = updatedTopLevel;
    return;
  }
  // console.log("swapping", originalIndex);
  if (originalParentId === SectionTitles.SolutionBox) {
    // top level swap
    // console.warn("top level swap");
    // add temp to top level
    updatedTopLevel.splice(originalTopLevelIndex, 0, tempId);
  } else if (originalIndex > -1) {
    // update ogChildBlocks
    // console.warn("updating old parent's children");
    parentChildren[originalIndex].id = tempId;
  }
  const swappedBlock =
    blocks.get(tempId) ?? throwNull(`temp block ${tempId} not found?`);
  swappedBlock.parentId = originalParentId;

  draft.solutionTopLevel = updatedTopLevel;
}

function removeChildFromParent(
  child: Draft<BlockData>,
  blocks: Draft<BlockContextType["blocks"]>,
  id: string,
): number {
  const parentId = child.parentId;
  const parentData = blocks.get(parentId);
  if (!parentData || !isBlockWithChildren(parentData)) {
    // probably a top level block
    return -1;
  }
  const parentChildren = parentData.children;
  const originalIndex = parentChildren.findIndex((slot) => slot.id === id);
  if (originalIndex === -1) {
    return originalIndex;
  }
  // console.log("removing from old parent's children");
  parentChildren[originalIndex].id = null;
  return originalIndex;
}

function removeChildFromTopLevel(
  solutionTopLevel: readonly string[],
  id: string,
) {
  const originalTopLevelIndex = solutionTopLevel.indexOf(id);
  const updatedTopLevel = solutionTopLevel.filter((blockId) => blockId !== id);
  return { originalTopLevelIndex, updatedTopLevel };
}

function setTopLevelParent(
  sectionTitle: string,
  blocks: Draft<BlockContextType["blocks"]>,
  id: string,
  updatedTopLevel: string[],
  active: Active | null,
  over: Over | null,
) {
  // top-level block
  // console.warn("new parent top level", sectionTitle);
  const parentData =
    blocks.get(id) ?? throwNull(`parent block ${id} not found?`);
  if (sectionTitle === SectionTitles.BlockLibrary) {
    parentData.parentId = SectionTitles.BlockLibrary;
    return updatedTopLevel;
  }
  // otherwise top level solution box
  parentData.parentId = SectionTitles.SolutionBox;
  if (sectionTitle === SectionTitles.SolutionBox) {
    // push to end of solution box
    updatedTopLevel.push(id);
    return updatedTopLevel;
  }
  if (!active || !over) {
    throw new Error(
      "expected dnd info to be populated when dropping into solution box",
    );
  }
  const overSortIndex = updatedTopLevel.indexOf(over.id.toString());
  // determine whether to sort before or after over
  const activeTop =
    active.rect.current.translated?.top ??
    throwNull("active rect ref somehow doesn't exist?");
  const overTopDist = Math.abs(over.rect.top - activeTop);
  const overBotDist = Math.abs(over.rect.bottom - activeTop);
  const sortAfter = overBotDist < overTopDist;
  const offset = sortAfter ? 1 : 0;
  // console.warn("sorting in place", overSortIndex, sortAfter);

  return updatedTopLevel.toSpliced(overSortIndex + offset, 0, id);
}
