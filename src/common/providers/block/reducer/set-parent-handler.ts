import type { BlockContextType } from "../BlockContext.ts";
import { SectionTitles, throwNull } from "../../../utils.ts";
import type { Active, Over } from "@dnd-kit/core";
import type { BlockDispatchType } from "./block-reducer.ts";
import type { Draft } from "immer";
import {
  type BlockData,
  isBlockWithChildrenData,
} from "../../../block-types.ts";
import { ArgumentSlotPrefix } from "../../../../components/block/slot/ArgumentSlot.tsx";

function fixExpandableParentSlots(
  originalIndex: number,
  originalParentId: string,
  blocks: Draft<BlockContextType["blocks"]>,
) {
  if (originalIndex === -1) return;
  // moves out of expandable blocks may mess up slot indices
  // get original parent block
  const originalParentBlock = getOriginalParentBlock(originalParentId, blocks);
  if (originalParentBlock.expandable) {
    // fix holes in original parent slots
    originalParentBlock.children = originalParentBlock.children.filter(
      (slot) => slot.id !== null,
    );
  }
  return;
}

export function handleSetParent(
  draft: Draft<BlockContextType>,
  action: BlockDispatchType,
): void {
  const blocks = draft.blocks;
  const solutionTopLevel: Draft<string[]> = draft.solution.topLevel;
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
    draft.solution.topLevel = [...newTopLevel];
    fixExpandableParentSlots(originalIndex, originalParentId, blocks);
    return;
  }

  const [newParentId, parsedSlotIndex] = suffix;
  const slotIndex = Number(parsedSlotIndex);
  // check for invalid swap first
  const newParent = blocks.get(newParentId);
  if (!newParent || !parsedSlotIndex || !isBlockWithChildrenData(newParent)) {
    throw new Error("new parent not found or has no children?");
  }
  const newChildren = newParent.children;
  // undo swap into an slot if:
  // - child isn't changing parents,
  // - parent is expandable, and
  // - the child is already in a lower indexed slot
  if (
    originalParentId === newParentId &&
    newParent.expandable &&
    originalIndex < slotIndex
  ) {
    // add back to original parent
    const originalParentBlock = getOriginalParentBlock(
      originalParentId,
      blocks,
    );
    originalParentBlock.children[originalIndex].id = id;
    return;
  }
  // fake slots may cause indexing past bounds
  if (slotIndex >= newChildren.length && newParent.expandable) {
    newChildren.push({
      id: null,
      locked: false,
      allowFirstClass: false,
    });
  }
  const tempId = newChildren[slotIndex].id;
  // don't allow swap with original parent
  if (tempId === originalParentId) {
    // console.warn("ignoring attempted swap with original parent");
    // add back to original parent
    const originalParentBlock = getOriginalParentBlock(
      originalParentId,
      blocks,
    );
    originalParentBlock.children[originalIndex].id = id;
    return;
  }
  child.parentId = newParentId;
  // potential swap
  newChildren[slotIndex].id = id;
  if (!tempId) {
    // no swap required
    draft.solution.topLevel = updatedTopLevel;
    fixExpandableParentSlots(originalIndex, originalParentId, blocks);
    return;
  }
  // console.warn("potential swap");
  if (originalParentId === SectionTitles.SolutionBox) {
    // top level swap
    // console.warn("top level swap");
    // add temp to top level
    updatedTopLevel.splice(originalTopLevelIndex, 0, tempId);
  } else if (originalIndex > -1) {
    // update ogChildBlocks
    // console.warn("updating old parent's children");
    const originalParentBlock =
      blocks.get(originalParentId) ?? throwNull("original parent should exist");
    if (!isBlockWithChildrenData(originalParentBlock)) {
      throw new Error("original parent should have children");
    }
    originalParentBlock.children[originalIndex].id = tempId;
  }
  const swappedBlock =
    blocks.get(tempId) ?? throwNull(`temp block ${tempId} not found?`);
  swappedBlock.parentId = originalParentId;

  draft.solution.topLevel = updatedTopLevel;
}

function getOriginalParentBlock(
  originalParentId: string,
  blocks: Draft<BlockContextType["blocks"]>,
) {
  const parentBlock =
    blocks.get(originalParentId) ?? throwNull("original parent should exist");
  if (!isBlockWithChildrenData(parentBlock)) {
    throw new Error("original parent should have children");
  }
  return parentBlock;
}

function removeChildFromParent(
  child: Draft<BlockData>,
  blocks: Draft<BlockContextType["blocks"]>,
  id: string,
): number {
  const parentId = child.parentId;
  const parentData = blocks.get(parentId);
  if (!parentData || !isBlockWithChildrenData(parentData)) {
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
