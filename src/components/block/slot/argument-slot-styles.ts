import type { BoxProps } from "@mui/material";

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
export const ArgumentSlotStyles: (fake: boolean | undefined) => BoxProps = (
  fake,
) => ({
  minHeight: "0.5em",
  minWidth: "1.5em",
  width: "fit-content",
  marginLeft: "0em",
  bgcolor: "white",
  padding: "0.4em",
  borderRadius: "0.5em",
  ...(fake ? FakeSlotStyles : null),
});
