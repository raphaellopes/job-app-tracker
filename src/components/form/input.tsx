import classNames from "classnames";
import FormField from "./form-field";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <FormField label={label}>
      <input className={classNames("border p-2 rounded", className)} {...props} />
    </FormField>
  );
};

export default Input;
