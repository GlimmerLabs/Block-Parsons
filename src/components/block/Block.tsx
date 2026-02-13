import { Box, Stack, type StackProps } from "@mui/material";
import { ArgumentSlot } from "./ArgumentSlot.tsx";
import { throwNull } from "../../common/utils.ts";
import { PresentationalArgumentSlot } from "./PresentationalArgumentSlot.tsx";
import { useDndContext } from "@dnd-kit/core";
import { useBlockContext } from "../../common/providers/block/BlockContext.ts";
import { isConstantBlock, type Slot } from "../../common/block-types.ts";
import { useCallback } from "react";

export interface BlockProps {
  id: string;
  presentational?: boolean;
  padding?: StackProps["padding"];
}

export function Block({
  id,
  presentational: presentationalProp,
  padding = "0.5em",
}: BlockProps) {
  const { blocks } = useBlockContext();
  const block =
    blocks.get(id) ?? throwNull(`attempted to render unknown block ${id}`);

  const { active } = useDndContext();
  const presentational = presentationalProp || active?.id === id;

  const getLockedBlockElement = useCallback(
    (slotId: string | null) => {
      if (!slotId) return <Box color={"black"} />;
      const childBlock =
        blocks.get(slotId) ??
        throwNull(`should have found block with id ${slotId}`);
      if (isConstantBlock(childBlock)) {
        return <Box color={"black"}>{childBlock.value}</Box>;
      }
      return <Block id={slotId} padding={0} presentational={presentational} />;
    },
    [blocks, presentational],
  );

  const getChildBlockElement = useCallback(
    (slot: Slot, index: number) => {
      const slotId = slot.id;
      if (slot.locked) {
        return getLockedBlockElement(slotId);
      }

      const idSuffix = `:${id}:${index.toString()}`;
      const propsToPass = { idSuffix, blockId: slotId };
      return presentational ? (
        <PresentationalArgumentSlot {...propsToPass} />
      ) : (
        <ArgumentSlot {...propsToPass} />
      );
    },
    [getLockedBlockElement, id, presentational],
  );

  if (isConstantBlock(block)) {
    return (
      <Box
        bgcolor={"lightgreen"}
        padding={"0.5em"}
        borderRadius={"0.5em"}
        fontFamily={"monospace"}
      >
        {block.value}
      </Box>
    );
  }

  const [firstChild, ...restChildren] = block.children;
  let firstSlot: Slot | null = firstChild;
  const restSlots = restChildren;
  if (!firstSlot.id || !firstSlot.locked) {
    restSlots.unshift(firstSlot);
    firstSlot = null;
  }

  return (
    <Stack
      width={"fit-content"}
      bgcolor={"lightgray"}
      padding={padding}
      borderRadius={"0.5em"}
      fontFamily={"monospace"}
      spacing={1}
      useFlexGap
    >
      <Stack
        direction="row"
        // if the current block has childblocks, align baseline, else align flex-start
        alignItems={
          restSlots.some((arg) => arg.id !== null) ? "baseline" : "flex-start"
        }
        spacing={1}
      >
        <Stack direction={"row"}>
          <Box>(</Box>
          {firstSlot &&
            // TODO: if only one slot, this one won't have an ending bracket
            getChildBlockElement(firstSlot, 0)}
        </Stack>
        <Stack spacing={1}>
          {restSlots.map((slot, index) => {
            const ChildBlock = getChildBlockElement(
              slot,
              firstSlot ? index + 1 : index,
            );
            const isLast = index === restSlots.length - 1;

            return (
              <Stack direction="row" alignItems="flex-end" key={index}>
                {ChildBlock}
                {isLast && (
                  <Box
                    marginLeft="0.25em"
                    {...(!slot.locked && slot.id && blocks.has(slot.id)
                      ? { marginBottom: "1em" }
                      : {})}
                  >
                    )
                  </Box>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
