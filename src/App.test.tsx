import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App shell", () => {
  it("renders the persistent authorization banner", () => {
    render(<App />);
    expect(screen.getByText("Authorized targets only")).toBeInTheDocument();
  });

  it("renders the Projects screen at the root route", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Projects" }),
    ).toBeInTheDocument();
  });
});
