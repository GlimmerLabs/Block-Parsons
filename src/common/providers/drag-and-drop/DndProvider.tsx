import { Block } from "../../../components/block/Block.tsx";
import { type PropsWithChildren, useCallback, useState } from "react";
import {
  defaultKeyboardCoordinateGetter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { collisionDetection } from "../../../components/solution-box/solution-box-utils.ts";
import { useBlockDispatchContext } from "../block/BlockDispatchContext.ts";

export function DndProvider({ children }: PropsWithChildren) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: defaultKeyboardCoordinateGetter,
    }),
  );

  const dispatch = useBlockDispatchContext();

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      // 1. find the original parent block,
      // 2. remove the active block from the original parent, and
      // 3. push to its new parent's child blocks
      const newParentId = over?.id.toString();
      if (!newParentId) {
        return;
      }
      dispatch({
        type: "SET_PARENT",
        payload: {
          id: active.id.toString(),
          parentId: newParentId,
          dndInfo: { active, over },
        },
      });

      setActiveId(null);
    },
    [dispatch],
  );

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id.toString());
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId ? <Block id={activeId} presentational={true} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
