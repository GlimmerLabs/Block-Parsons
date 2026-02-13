export interface Slot {
  id: string | null;
  locked: boolean;
}

type BlockType = "ConstantBlock" | "BlockWithChildren";

interface BaseBlockData {
  type: BlockType;
  parentId: string;
}

export interface ConstantBlockData extends BaseBlockData {
  type: "ConstantBlock";
  value: string;
}

interface BlockWithChildrenData extends BaseBlockData {
  type: "BlockWithChildren";
  children: Slot[];
  expandable?: boolean;
}

export type BlockData = ConstantBlockData | BlockWithChildrenData;

export function isConstantBlockData(
  block: BlockData,
): block is ConstantBlockData {
  return block.type === "ConstantBlock";
}

export function isBlockWithChildrenData(
  block: BlockData,
): block is BlockWithChildrenData {
  return block.type === "BlockWithChildren";
}
