import { describe, it, expect } from "vitest";
import { buildSelector } from "../../src/lib/selector.js";

describe("buildSelector", () => {
  it("prefers the element's id when present", () => {
    document.body.innerHTML = `<div><button id="submit-button">Go</button></div>`;
    const el = document.getElementById("submit-button")!;
    expect(buildSelector(el)).toBe("#submit-button");
  });

  it("falls back to a tag path when there's no id", () => {
    document.body.innerHTML = `<div class="form"><button>Go</button></div>`;
    const el = document.querySelector("button")!;
    expect(buildSelector(el)).toBe("div > button");
  });

  it("adds :nth-of-type when there are multiple same-tag siblings", () => {
    document.body.innerHTML = `<div><button>A</button><button>B</button></div>`;
    const second = document.querySelectorAll("button")[1];
    expect(buildSelector(second)).toBe("div > button:nth-of-type(2)");
  });
});
