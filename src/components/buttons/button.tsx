import classNames from "classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = "primary", ...props }) => {
  return (
    <button
      className={classNames(className, {
        "button-primary": variant === "primary",
        "button-secondary": variant === "secondary",
        "button-danger": variant === "danger",
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
