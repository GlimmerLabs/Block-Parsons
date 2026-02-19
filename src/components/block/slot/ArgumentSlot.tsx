import { BlockLabels } from "../block-aria-labels.ts";
import { Box, type BoxProps } from "@mui/material";
import { Block, type BlockProps } from "../Block.tsx";
import { useDroppable } from "@dnd-kit/core";
import { Draggable } from "../../../common/dnd-wrappers/Draggable.tsx";
import type { ReactElement } from "react";
import { ArgumentSlotStyles } from "./argument-slot-styles.ts";

export interface ArgumentSlotProps {
  idSuffix: string;
  blockId?: string | null;
  allowFirstClass?: boolean;
  fake?: boolean;
}

export const ArgumentSlotPrefix = "argument slot of ";
const FakeSlotStyles: BoxProps = {
  bgcolor: "grey",
  position: "relative",
  sx: {
    isolation: "isolate",
    "&::before": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      content: '"+"',
      textAlign: "center",
      fontSize: "1rem",
      fontWeight: "bold",
      color: "text.primary",
      opacity: 0.5,
      zIndex: -1,
      userSelect: "none",
    },
  },
};

export function ArgumentSlot({
  idSuffix,
  blockId,
  allowFirstClass = false,
  fake = false,
}: ArgumentSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${ArgumentSlotPrefix}${idSuffix}`,
  });

  const ChildBlock: ReactElement<BlockProps> | null = !blockId ? null : (
    <Block id={blockId} allowFirstClass={allowFirstClass} />
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
      {...(fake ? FakeSlotStyles : null)}
    >
      {ChildBlock ? (
        <Draggable id={ChildBlock.props.id}>{ChildBlock}</Draggable>
      ) : null}
    </Box>
  );
}
