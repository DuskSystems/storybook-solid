import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { action } from "storybook/actions";
import { expect, fn, mocked, userEvent, within } from "storybook/test";
import preview from "#.storybook/preview";
import { Button, type ButtonProps } from "./Button";

const meta = preview.meta({
  id: "button-component",
  title: "Example/Button",
  component: Button,
  argTypes: {
    backgroundColor: { control: "color" },
  },
  args: {
    children: "Children coming from meta args",
  },
  tags: ["autodocs"],
});

export const Primary = meta.story({
  args: {
    children: "foo",
    size: "large",
    primary: true,
  },
});

export const Base = meta.story({
  args: { children: "foo" },
});

export const WithRender = meta.story({
  ...Base.input,
  render: (args) => (
    <div>
      <p data-testid="custom-render">I am a custom render function</p>
      <Button {...args} />
    </div>
  ),
});

export const HooksStory = meta.story({
  render: function Component() {
    const [isClicked, setClicked] = useState(false);
    return (
      <>
        <input data-testid="input" />
        <br />
        <button
          onClick={() => setClicked(!isClicked)}
          type="button"
        >
          I am {isClicked ? "clicked" : "not clicked"}
        </button>
      </>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Step label", async () => {
      const inputEl = canvas.getByTestId("input");
      const buttonEl = canvas.getByRole("button");
      await userEvent.click(buttonEl);
      await userEvent.type(inputEl, "Hello world!");

      await expect(inputEl).toHaveValue("Hello world!");
      await expect(buttonEl).toHaveTextContent("I am clicked");
    });
  },
});

export const InputFieldFilled = meta.story({
  render: () => {
    return <input data-testid="input" />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Step label", async () => {
      const inputEl = canvas.getByTestId("input");
      await userEvent.type(inputEl, "Hello world!");

      await expect(inputEl).toHaveValue("Hello world!");
    });
  },
});

const mockFn = fn();

// NOTE: This appears broken with React, but correct with Solid.
// @ts-expect-error TODO: add a way to provide custom args/argTypes
export const LoaderStory = meta.story({
  args: {
    mockFn,
  },
  loaders: [
    async () => {
      mockFn.mockReturnValueOnce("mockFn return value");
      return {
        value: "loaded data",
      };
    },
  ],
  render: (args: ButtonProps & { mockFn: (val: string) => string }, { loaded }) => {
    const data = args.mockFn("render");
    return (
      <div>
        <div data-testid="loaded-data">{loaded.value}</div>
        <div data-testid="spy-data">{String(data)}</div>
      </div>
    );
  },
  play: async () => {
    expect(mockFn).toHaveBeenCalledWith("render");
  },
});

export const MountInPlayFunction = meta.story({
  args: {
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    mockFn: fn(),
  },
  play: async ({ args, mount, context }) => {
    // equivalent of loaders
    const loadedData = await Promise.resolve("loaded data");

    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    mocked(args.mockFn).mockReturnValueOnce("mockFn return value");

    // equivalent of render
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    const data = args.mockFn("render");

    // TODO refactor this in the mount args PR
    context.originalStoryFn = () => (
      <div>
        <div data-testid="loaded-data">{loadedData}</div>
        <div data-testid="spy-data">{String(data)}</div>
      </div>
    );

    await mount();

    // equivalent of play
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    expect(args.mockFn).toHaveBeenCalledWith("render");
  },
});

export const WithActionArg = meta.story({
  args: {
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    someActionArg: action("some-action-arg"),
  },
  render: (args) => {
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    args.someActionArg("in render");

    return (
      <button
        onClick={() => {
          // @ts-expect-error TODO: add a way to provide custom args/argTypes
          args.someActionArg("on click");
        }}
        type="button"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttonEl = canvas.getByRole("button");
    buttonEl.click();
  },
});

export const WithActionArgType = meta.story({
  argTypes: {
    // @ts-expect-error TODO: add a way to provide custom args/argTypes
    someActionArg: {
      action: true,
    },
  },
  render: () => {
    return <div>nothing</div>;
  },
});

export const Modal = meta.story({
  render: function Component() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalContainer] = useState(() => {
      const div = document.createElement("div");
      div.id = "modal-root";
      return div;
    });

    useEffect(() => {
      document.body.appendChild(modalContainer);

      return () => {
        document.body.removeChild(modalContainer);
      };
    }, [modalContainer]);

    return (
      <>
        <button
          id="openModalButton"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          Open Modal
        </button>

        {isModalOpen
          ? createPortal(
              <div
                role="dialog"
                style={{
                  position: "fixed",
                  top: "20%",
                  left: "50%",
                  transform: "translate(-50%, -20%)",
                  backgroundColor: "white",
                  padding: "20px",
                  zIndex: 1000,
                  border: "2px solid black",
                  borderRadius: "5px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <p>This is a modal!</p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>,
              modalContainer,
            )
          : null}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openModalButton = canvas.getByRole("button", { name: /open modal/i });
    await userEvent.click(openModalButton);
    await expect(within(document.body).getByRole("dialog")).toBeInTheDocument();
  },
  tags: ["no-snapshot"],
});
