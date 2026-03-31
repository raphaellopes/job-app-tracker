import classNames from "classnames";
import FormField from "./form-field";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ id, label, required = false, className, ...props }) => {
  return (
    <FormField label={label} id={id} required={required}>
      <input
        id={id}
        className={classNames("border p-2 rounded", className)}
        required={required}
        {...props}
      />
    </FormField>
  );
};

export default Input;
