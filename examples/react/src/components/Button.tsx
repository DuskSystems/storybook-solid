import type { ReactNode } from "react";
import "./Button.css";

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;

  /**
   * What background color to use
   */
  backgroundColor?: string;

  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";

  /**
   * Button contents
   */
  children: ReactNode;

  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = ({ primary = false, size = "medium", backgroundColor, children, onClick }: ButtonProps) => {
  const mode = primary ? "storybook-button--primary" : "storybook-button--secondary";

  return (
    <button
      className={["storybook-button", `storybook-button--${size}`, mode].join(" ")}
      onClick={onClick}
      style={{ backgroundColor }}
      type="button"
    >
      {children}
    </button>
  );
};
