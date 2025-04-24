import type { JSX } from "solid-js";
import "./Button.css";

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   * @default false
   */
  primary?: boolean;

  /**
   * What background color to use
   */
  backgroundColor?: string;

  /**
   * How large should the button be?
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Button contents
   */
  children: JSX.Element;

  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = (props: ButtonProps) => {
  const mode = () => (props.primary ? "storybook-button--primary" : "storybook-button--secondary");
  const size = () => props.size || "medium";

  return (
    <button
      class={["storybook-button", `storybook-button--${size()}`, mode()].join(" ")}
      onClick={props.onClick}
      style={{ "background-color": props.backgroundColor }}
      type="button"
    >
      {props.children}
    </button>
  );
};
