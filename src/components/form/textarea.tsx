import classNames from "classnames";
import FormField from "./form-field";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  required = false,
  className,
  ...props
}) => {
  return (
    <FormField label={label} id={id} required={required}>
      <textarea
        id={id}
        className={classNames("border p-2 rounded", className)}
        required={required}
        {...props}
      />
    </FormField>
  );
};

export default Textarea;
