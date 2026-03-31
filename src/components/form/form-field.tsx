import classNames from "classnames";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, className, children, ...props }) => {
  return (
    <div className={classNames("flex flex-col gap-2", className)} {...props}>
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
    </div>
  );
};

export default FormField;
