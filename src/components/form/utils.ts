import classNames from "classnames";

/**
 * Get the class name for the form fields such as input, select, textarea
 * @param className - The class name to add
 * @param error - Whether the input has an error
 * @returns The class name
 */
export const getFormFieldClassName = (className?: string, error?: boolean) => {
  return classNames(
    "border p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed",
    error && "input-error",
    className,
  );
};
