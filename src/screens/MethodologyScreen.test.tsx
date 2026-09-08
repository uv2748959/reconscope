import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MethodologyScreen from "./MethodologyScreen";

describe("MethodologyScreen — FR-14", () => {
  it("explains the passive vs. active distinction and the boundary before Scanning", () => {
    render(<MethodologyScreen />);

    expect(
      screen.getByRole("heading", { name: /safety.*methodology/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /passive vs\. active/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /boundary before scanning/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/port scanning/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/whois/i).length).toBeGreaterThan(0);
  });
});
