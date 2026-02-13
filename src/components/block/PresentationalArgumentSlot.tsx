import { BlockLabels } from "./aria-labels.ts";
import { Box } from "@mui/material";
import { Block, type BlockProps } from "./Block.tsx";
import type { ReactElement } from "react";
import type { ArgumentSlotProps } from "./ArgumentSlot.tsx";
import { ArgumentSlotStyles } from "./argument-slot-styles.ts";

export function PresentationalArgumentSlot({ blockId }: ArgumentSlotProps) {
  const ChildBlock: ReactElement<BlockProps> | null = !blockId ? null : (
    <Block id={blockId} presentational={true} />
  );
  return (
    <Box
      {...ArgumentSlotStyles}
      aria-label={BlockLabels.PresentationalArgumentSlot}
    >
      {ChildBlock}
    </Box>
  );
}
