import { Box } from "@mui/material";
import type { ConstantBlockData } from "../../common/block-types.ts";

const ConstantBlockStyles = {
  padding: "0.5em",
  borderRadius: "0.5em",
  fontFamily: "monospace",
};

export const ConstantBlockColors = {
  Procedure: "lightblue",
  Value: "lightgreen",
} as const;
type BlockColor =
  (typeof ConstantBlockColors)[keyof typeof ConstantBlockColors];

type ConstantBlockProps = Pick<ConstantBlockData, "value"> & {
  color?: BlockColor;
};

export function ConstantBlock({
  value,
  color = ConstantBlockColors.Value,
}: ConstantBlockProps) {
  return (
    <Box bgcolor={color} {...ConstantBlockStyles}>
      {value}
    </Box>
  );
}
