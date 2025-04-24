import type { StoryContext } from "@storybook/react-vite";
import { page, server } from "@vitest/browser/context";
import { afterEach, beforeAll, expect } from "vitest";
import preview from "#.storybook/preview";

interface TestContext {
  story: StoryContext;
}

beforeAll(preview.composed.beforeAll);

afterEach<TestContext>(async ({ story }) => {
  if (story.tags.includes("no-snapshot")) {
    console.log("Skipping");
    return;
  }

  const element = document.querySelector("body > div:last-of-type > :first-child");
  if (!element) {
    console.warn("Element not found");
    return;
  }

  // Capture element snapshot
  expect(element).toMatchSnapshot(story.storyName);

  // Capture element screenshot
  await page.screenshot({
    path: `__screenshots__/${story.storyName}_${server.browser}.png`,
    element,
  });
});
