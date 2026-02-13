import { BlockLabels } from "./aria-labels.ts";
import { Box } from "@mui/material";
import { Block, type BlockProps } from "./Block.tsx";
import { useDroppable } from "@dnd-kit/core";
import { Draggable } from "../../common/dnd-wrappers/Draggable.tsx";
import type { ReactElement } from "react";
import { ArgumentSlotStyles } from "./argument-slot-styles.ts";

export interface ArgumentSlotProps {
  idSuffix: string;
  blockId?: string | null;
}

export const ArgumentSlotPrefix = "argument slot of ";

export function ArgumentSlot({ idSuffix, blockId }: ArgumentSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${ArgumentSlotPrefix}${idSuffix}`,
  });

  const ChildBlock: ReactElement<BlockProps> | null = !blockId ? null : (
    <Block id={blockId} />
  );
  return (
    <Box
      {...ArgumentSlotStyles}
      aria-label={BlockLabels.ArgumentSlot}
      ref={setNodeRef}
      {...(isOver
        ? {
            boxShadow: "inset 0 0 0 0.25em lightgreen",
          }
        : null)}
    >
      {ChildBlock ? (
        <Draggable id={ChildBlock.props.id}>{ChildBlock}</Draggable>
      ) : null}
    </Box>
  );
}
