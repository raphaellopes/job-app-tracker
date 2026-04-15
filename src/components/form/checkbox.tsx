import { CheckboxBlankIcon } from "@/components/icons/checkbox-blank-icon";
import { CheckboxCheckedIcon } from "@/components/icons/checkbox-checked-icon";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, checked, ...props }) => {
  const Icon = checked ? CheckboxCheckedIcon : CheckboxBlankIcon;

  const renderIput = (
    <>
      <input type="checkbox" id={id} className="rounded border-gray-300 hidden" {...props} />
      <Icon size="lg" className="text-blue-700" />
    </>
  );

  if (!label) {
    return renderIput;
  }

  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      {renderIput}
      {label}
    </label>
  );
};

export default Checkbox;
