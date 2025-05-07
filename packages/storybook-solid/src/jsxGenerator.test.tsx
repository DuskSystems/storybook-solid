import { describe, expect, it } from "vitest";
import { jsxGenerator } from "./jsxGenerator";

describe("jsxGenerator", () => {
  it("works", async () => {
    const result = await jsxGenerator("MyButton", { type: "submit" }, "Click me!");
    expect(result).toMatchInlineSnapshot(`"<MyButton type="submit">Click me!</MyButton>"`);
  });
});
