export interface Slot {
  id: string | null;
  locked: boolean;
}

type BlockType = "ConstantBlock" | "BlockWithChildren";

interface BaseBlock {
  type: BlockType;
  parentId: string;
}

interface ConstantBlock extends BaseBlock {
  type: "ConstantBlock";
  value: string;
}

interface BlockWithChildren extends BaseBlock {
  type: "BlockWithChildren";
  children: Slot[];
  expandable?: boolean;
}

export type BlockData = ConstantBlock | BlockWithChildren;

export function isConstantBlock(block: BlockData): block is ConstantBlock {
  return block.type === "ConstantBlock";
}

export function isBlockWithChildren(
  block: BlockData,
): block is BlockWithChildren {
  return block.type === "BlockWithChildren";
}
