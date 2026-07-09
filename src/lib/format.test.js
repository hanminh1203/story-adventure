import { describe, expect, it } from "vitest";
import { formatTemplate } from "./format";

describe("formatTemplate", () => {
  it("replaces matching placeholders", () => {
    expect(formatTemplate("Hello {name}", { name: "Ruby" })).toBe("Hello Ruby");
  });

  it("leaves missing placeholders unchanged", () => {
    expect(formatTemplate("Hello {name} from {place}", { name: "Ruby" })).toBe(
      "Hello Ruby from {place}"
    );
  });

  it("coerces non-string templates", () => {
    expect(formatTemplate(null, { value: "x" })).toBe("null");
  });
});
