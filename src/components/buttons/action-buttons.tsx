import Button, { ButtonProps } from "./button";

interface ActionButtonsProps {
  items: ButtonProps[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ items }) => {
  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <Button key={item.id} {...item} />
      ))}
    </div>
  );
};

export default ActionButtons;
