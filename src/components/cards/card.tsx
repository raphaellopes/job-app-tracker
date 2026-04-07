import classNames from "classnames";

type CardVariant = "default" | "primary" | "error";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

type CardStyle = {
  container: string;
  content: string;
};

const styles: Record<CardVariant, CardStyle> = {
  default: {
    container: "bg-white border border-gray-200",
    content: "text-gray-800",
  },
  primary: {
    container: "bg-blue-50 border border-blue-200",
    content: "text-blue-800",
  },
  error: {
    container: "bg-red-50 border border-red-200",
    content: "text-red-800",
  },
};
const Card: React.FC<CardProps> = ({ variant = "default", className, children, ...props }) => {
  const style = styles[variant];

  return (
    <div className={classNames("rounded-lg p-3", style.container, className)} {...props}>
      <div className={classNames("text-sm", style.content)}>{children}</div>
    </div>
  );
};

export default Card;
