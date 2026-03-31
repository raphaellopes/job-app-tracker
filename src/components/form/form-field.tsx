import classNames from "classnames";
import ErrorBox from "./error-box";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string | null;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  className,
  children,
  error,
  ...props
}) => {
  return (
    <div
      className={classNames("flex flex-col gap-1", className, error && "text-red-500")}
      {...props}
    >
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span>*</span>}:
        </label>
      )}
      {children}
      {error && <ErrorBox>{error}</ErrorBox>}
    </div>
  );
};

export default FormField;
