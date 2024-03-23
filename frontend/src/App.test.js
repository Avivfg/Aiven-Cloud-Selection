import { getByTestId, render, screen } from "@testing-library/react";
import App from "./App";

// Create in ts after the conversion

describe(App, () => {
  it("counter displays correct initial count", () => {
    const { getAllByTestId } = render(<App />);
    const countvalue = getByTestId("count").textContent;
    expect(countvalue).toEqual("0");
  });
});
