import classNames from "classnames";

interface DividerTextProps {
  children: React.ReactNode;
  className?: string;
}

const DividerText: React.FC<DividerTextProps> = ({ children, className }) => {
  return (
    <div className={classNames("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-gray-500">{children}</span>
      </div>
    </div>
  );
};

export default DividerText;
