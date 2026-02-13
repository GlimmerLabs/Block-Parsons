import { MainContent } from "./MainContent.tsx";
import { BlockProvider } from "../common/providers/block/BlockProvider.tsx";
import { DndProvider } from "../common/providers/drag-and-drop/DndProvider.tsx";

export function App() {
  return (
    <BlockProvider>
      <DndProvider>
        <MainContent />
      </DndProvider>
    </BlockProvider>
  );
}
