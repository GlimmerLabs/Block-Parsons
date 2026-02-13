import { Stack } from "@mui/material";
import { Block } from "../block/Block.tsx";
import { Draggable } from "../../common/dnd-wrappers/Draggable.tsx";
import { useBlockContext } from "../../common/providers/block/BlockContext.ts";
import { SectionTitles } from "../../common/utils.ts";

export function BlockLibrary() {
  const { blocks } = useBlockContext();
  const libraryBlocks = [...blocks.entries()]
    .filter(([, data]) => data.parentId === SectionTitles.BlockLibrary)
    .map(([id]) => id);

  return (
    <Stack>
      <Stack
        padding={"0.5em"}
        boxSizing={"border-box"}
        width={"fit-content"}
        minHeight={"2em"}
        minWidth={"100%"}
        aria-label="Block Library"
        spacing={1}
        justifyContent={"space-evenly"}
      >
        {libraryBlocks.map((id) => (
          <Draggable key={id} id={id}>
            <Block id={id} presentational={true} />
          </Draggable>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}></Stack>
    </Stack>
  );
}
