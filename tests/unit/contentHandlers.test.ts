import { describe, it, expect } from "vitest";
import {
  handleClickTarget,
  handleInputTarget,
  handleNavigation,
} from "../../src/lib/contentHandlers.js";
import { REDACTED } from "../../src/lib/redact.js";

describe("handleClickTarget", () => {
  it("builds a click event carrying the clicked element's selector", () => {
    document.body.innerHTML = `<button id="submit">Go</button>`;
    const el = document.getElementById("submit")!;

    const event = handleClickTarget(el, 1000);

    expect(event).toEqual({
      type: "click",
      kind: "click",
      timestamp: 1000,
      selector: "#submit",
    });
  });
});

describe("handleInputTarget", () => {
  it("captures the value for a non-sensitive field", () => {
    document.body.innerHTML = `<input id="email" type="email" value="alice@example.com" />`;
    const el = document.getElementById("email") as HTMLInputElement;

    const event = handleInputTarget(el, 1000);

    expect(event.selector).toBe("#email");
    expect(event.value).toBe("alice@example.com");
  });

  it("redacts the value for a password field", () => {
    document.body.innerHTML = `<input id="pw" type="password" value="hunter2" />`;
    const el = document.getElementById("pw") as HTMLInputElement;

    const event = handleInputTarget(el, 1000);

    expect(event.value).toBe(REDACTED);
  });
});

describe("handleNavigation", () => {
  it("builds a navigate event with the destination URL", () => {
    const event = handleNavigation("https://example.com/dashboard", 2000);
    expect(event).toEqual({
      type: "click",
      kind: "navigate",
      timestamp: 2000,
      selector: "",
      url: "https://example.com/dashboard",
    });
  });
});
