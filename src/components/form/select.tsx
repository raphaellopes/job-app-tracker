import FormField from "./form-field";
import { getFormFieldClassName } from "./utils";

type SelectOption = {
  label: string;
  value: string;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string | null;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  required = false,
  className,
  options,
  error,
  ...props
}) => {
  return (
    <FormField label={label} id={id} required={required} error={error}>
      <select
        id={id}
        className={getFormFieldClassName(className, !!error)}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default Select;
