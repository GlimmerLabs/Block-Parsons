import { beforeEach, expect, it } from "vitest";
import { render, type RenderResult } from "@testing-library/react";
import { Block } from "./Block.tsx";
import { BlockProvider } from "../common/providers/block/BlockProvider.tsx";
import { DndProvider } from "../common/providers/drag-and-drop/DndProvider.tsx";

describe("Block component", () => {
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(
      <BlockProvider>
        <DndProvider>
          <Block id="test-block-id" />
        </DndProvider>
      </BlockProvider>
    );
  });

  it("renders without crashing", () => {
    expect(renderResult.container).toBeInTheDocument();
  });
});
