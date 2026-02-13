import { Box } from "@mui/material";
import type { ConstantBlockData } from "../../common/block-types.ts";

const ConstantBlockStyles = {
  padding: "0.5em",
  borderRadius: "0.5em",
  fontFamily: "monospace",
};

type ConstantBlockProps = Pick<ConstantBlockData, "value">;

export function ConstantBlock({ value }: ConstantBlockProps) {
  return (
    <Box bgcolor={"lightgreen"} {...ConstantBlockStyles}>
      {value}
    </Box>
  );
}
