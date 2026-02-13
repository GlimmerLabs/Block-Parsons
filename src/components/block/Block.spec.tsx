import { beforeEach, expect, it } from "vitest";
import { render, type RenderResult } from "@testing-library/react";
import { Block } from "./Block.tsx";
import { GenericSlotLabel } from "./aria-labels.ts";
import { newUUID } from "../../common/utils.ts";

describe("Block component", () => {
  const testName = "Block component test block";
  const argumentAmt = 3;
  const testBlock1 = (
    <Block
      id={newUUID()}
      name={testName}
      argumentOptions={{ minAmount: argumentAmt }}
    />
  );
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(testBlock1);
  });

  it("renders passed name prop", () => {
    expect(renderResult.getByText(new RegExp(testName))).toBeInTheDocument();
  });
  it("renders the correct amount of arguments", () => {
    expect(
      renderResult.getAllByLabelText(new RegExp(GenericSlotLabel)),
    ).toHaveLength(argumentAmt);
  });
  it("renders with passed Block children", () => {
    const testName2 = "Parent block";
    const argumentAmt = 2;
    renderResult.unmount();
    renderResult = render(
      <Block
        id={newUUID()}
        name={testName2}
        argumentOptions={{ minAmount: argumentAmt }}
        childBlocks={[testBlock1.props]}
      />,
    );

    expect(renderResult.getByText(new RegExp(testName2))).toBeInTheDocument();
    expect(renderResult.getByText(new RegExp(testName))).toBeInTheDocument();
  });
});

//testing expandable and non-expandable blocks
describe("Block component", () => {
  const testName = "Block component test block";
  // used as a child block with 0 arguments of its own
  const argumentAmt = 0;
  const testBlock2 = (
    <Block
      id={newUUID()}
      name={testName}
      argumentOptions={{ minAmount: argumentAmt }}
    />
  );
  let renderResult: RenderResult;
  //testing non-expandable blocks
  it("renders non-expandable", () => {
    const testName1 = "non-expandable";
    const argumentAmt = 2;
    const expand = false;
    renderResult = render(
      <Block
        id={newUUID()}
        name={testName1}
        argumentOptions={{ minAmount: argumentAmt, expandable: expand }}
        childBlocks={[testBlock2.props]}
      />,
    );
    expect(
      renderResult.getAllByLabelText(new RegExp(GenericSlotLabel)),
    ).toHaveLength(argumentAmt);
    expect(renderResult.getByText(new RegExp(testName))).toBeInTheDocument();
    expect(renderResult.getByText(new RegExp(testName1))).toBeInTheDocument();
  });
  it("renders expandable", () => {
    const testName2 = "expandable";
    const argumentAmt = 2;
    const expand = true;
    renderResult = render(
      <Block
        id={newUUID()}
        name={testName2}
        argumentOptions={{ minAmount: argumentAmt, expandable: expand }}
        childBlocks={[testBlock2.props]}
      />,
    );
    // if expandable, have an argument amount that is 1 more
    expect(
      renderResult.getAllByLabelText(new RegExp(GenericSlotLabel)),
    ).toHaveLength(argumentAmt + 1);
    expect(renderResult.getByText(new RegExp(testName2))).toBeInTheDocument();
    expect(renderResult.getByText(new RegExp(testName))).toBeInTheDocument();
  });
});
