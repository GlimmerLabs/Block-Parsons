import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlockLibrary } from "./BlockLibrary.tsx";

describe("BlockLibrary component", () => {
  it("renders example blocks inside the block library", () => {
    render(<BlockLibrary />);
    expect(screen.getByText(/small-circle/i)).toBeInTheDocument();
    expect(screen.getByText(/medium-rectangle/i)).toBeInTheDocument();
  });
  // TODO: make more useful tests
});
