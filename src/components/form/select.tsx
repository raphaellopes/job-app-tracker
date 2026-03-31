import classNames from "classnames";
import FormField from "./form-field";

type SelectOption = {
  label: string;
  value: string;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  required = false,
  className,
  options,
  ...props
}) => {
  return (
    <FormField label={label} id={id} required={required}>
      <select
        id={id}
        className={classNames("border p-2 rounded", className)}
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
