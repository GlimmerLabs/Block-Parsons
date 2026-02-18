import { Box, Stack, type StackProps } from "@mui/material";
import { ArgumentSlot } from "./slot/ArgumentSlot.tsx";
import { throwNull } from "../../common/utils.ts";
import { PresentationalArgumentSlot } from "./slot/PresentationalArgumentSlot.tsx";
import { useDndContext } from "@dnd-kit/core";
import { useBlockContext } from "../../common/providers/block/BlockContext.ts";
import {
  canBeFirstClass,
  isConstantBlockData,
  type Slot,
} from "../../common/block-types.ts";
import { useCallback } from "react";
import { ConstantBlock, ConstantBlockColors } from "./ConstantBlock.tsx";

export interface BlockProps {
  id: string;
  presentational?: boolean;
  padding?: StackProps["padding"];
  allowFirstClass?: boolean;
}

export function Block({
  id,
  presentational: presentationalProp,
  padding = "0.4em",
  allowFirstClass = true,
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
      if (isConstantBlockData(childBlock)) {
        return <Box color={"black"}>{childBlock.value}</Box>;
      }
      return (
        <Block
          id={slotId}
          padding={0}
          presentational={presentational}
          allowFirstClass={false}
        />
      );
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
      const propsToPass = {
        idSuffix,
        blockId: slotId,
        allowFirstClass: slot.allowFirstClass,
      };
      return presentational ? (
        <PresentationalArgumentSlot {...propsToPass} />
      ) : (
        <ArgumentSlot {...propsToPass} />
      );
    },
    [getLockedBlockElement, id, presentational],
  );

  if (isConstantBlockData(block)) return <ConstantBlock value={block.value} />;

  if (allowFirstClass && canBeFirstClass(block)) {
    const identifierBlock =
      blocks.get(block.children[0].id) ??
      throwNull("should have got function's first child");
    if (isConstantBlockData(identifierBlock))
      return (
        <ConstantBlock
          value={identifierBlock.value}
          color={ConstantBlockColors.Procedure}
        />
      );
  }

  const [firstChild, ...restChildren] = block.children;
  let firstSlot: Slot | null = firstChild;
  const restSlots = restChildren;
  if (!firstSlot.id || !firstSlot.locked) {
    restSlots.unshift(firstSlot);
    firstSlot = null;
  }

  const firstSlotHasChildren =
    firstChild.id !== null &&
    (blocks.get(firstChild.id) ?? throwNull("first child should exist"))
      .type === "BlockWithChildren";

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
        // if the first slot is not a constant block, try column instead.
        direction={firstSlotHasChildren ? "column" : "row"}
        // if the current block has childblocks, align baseline, else align flex-start
        alignItems={
          restSlots.some((arg) => arg.id !== null) ? "baseline" : "flex-start"
        }
        spacing={1}
      >
        <Stack direction={"row"}>
          <Box>(</Box>
          {firstSlot && getChildBlockElement(firstSlot, 0)}
          {restSlots.length === 0 && <Box>)</Box>}
        </Stack>
        {restSlots.length > 0 && (
          <Stack spacing={1}>
            {restSlots.map((slot, index) => {
              const ChildBlock = getChildBlockElement(
                slot,
                firstSlot ? index + 1 : index,
              );
              const isLast = index === restSlots.length - 1;

              return (
                <Stack direction="row" alignItems="flex-end" key={index}>
                  {firstSlotHasChildren && <Box minWidth={"3em"} />}
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
        )}
      </Stack>
    </Stack>
  );
}
