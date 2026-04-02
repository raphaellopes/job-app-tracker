import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button className={classNames("button-primary", className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
