import classNames from "classnames";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, className, children, ...props }) => {
  return (
    <div className={classNames("flex flex-col gap-1", className)} {...props}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export default FormField;
