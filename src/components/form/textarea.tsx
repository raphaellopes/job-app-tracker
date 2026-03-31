import classNames from "classnames";
import FormField from "./form-field";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => {
  return (
    <FormField label={label}>
      <textarea className={classNames("border p-2 rounded", className)} {...props} />
    </FormField>
  );
};

export default Textarea;
