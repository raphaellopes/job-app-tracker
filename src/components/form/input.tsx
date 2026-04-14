import FormField from "./form-field";
import { getFormFieldClassName } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  required = false,
  className,
  error,
  containerClassName,
  ...props
}) => {
  return (
    <FormField
      label={label}
      id={id}
      required={required}
      error={error}
      className={containerClassName}
    >
      <input
        id={id}
        className={getFormFieldClassName(className, !!error)}
        required={required}
        {...props}
      />
    </FormField>
  );
};

export default Input;
