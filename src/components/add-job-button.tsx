'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon } from '@/components/icons/plus-icon';

interface AddJobButtonProps {
  isDisabled?: boolean;
}

const baseStyles = "flex items-center justify-center w-8 h-8 !rounded-full transition-colors";
const enabledStyles = "button-primary";
const disabledStyles = "bg-gray-400 text-white cursor-not-allowed opacity-50";

export function AddJobButton({ isDisabled = false }: AddJobButtonProps) {
  const pathname = usePathname();

  if (isDisabled) {
    return (
      <button
        disabled
        className={`${baseStyles} ${disabledStyles}`}
        aria-label="Add new job (disabled while editing)"
      >
        <PlusIcon />
      </button>
    );
  }

  return (
    <Link
      href={`${pathname}?add=true`}
      className={`${baseStyles} ${enabledStyles}`}
      aria-label="Add new job"
    >
      <PlusIcon />
    </Link>
  );
}
