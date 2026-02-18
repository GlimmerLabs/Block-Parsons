import { Block } from "../block/Block.tsx";
import { Sortable } from "../../common/dnd-wrappers/Sortable.tsx";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBlockContext } from "../../common/providers/block/BlockContext.ts";
import { useDndContext } from "@dnd-kit/core";

export function SolutionBox() {
  const {
    solution: { topLevel },
  } = useBlockContext();
  const { active } = useDndContext();
  const sortedBlockIds = [...topLevel.keys()];

  return (
    <SortableContext
      items={sortedBlockIds}
      strategy={verticalListSortingStrategy}
    >
      {topLevel.map((id) => (
        <Sortable id={id} key={id}>
          <Block
            id={id}
            presentational={active?.id === id}
            allowFirstClass={false}
          />
        </Sortable>
      ))}
    </SortableContext>
  );
}
