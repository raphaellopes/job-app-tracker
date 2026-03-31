import FormField from "./form-field";
import { getFormFieldClassName } from "./utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  required = false,
  className,
  error,
  ...props
}) => {
  return (
    <FormField label={label} id={id} required={required} error={error}>
      <textarea
        id={id}
        className={getFormFieldClassName(className, !!error)}
        required={required}
        {...props}
      />
    </FormField>
  );
};

export default Textarea;
