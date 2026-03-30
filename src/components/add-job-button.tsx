"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "@/components/icons/plus-icon";
import { JobStatusType } from "@/actions/jobs";

interface AddJobButtonProps {
  isDisabled?: boolean;
  status?: JobStatusType;
}

const baseStyles = "flex items-center justify-center w-8 h-8 !rounded-full transition-colors";
const enabledStyles = "button-primary";
const disabledStyles = "bg-gray-400 text-white cursor-not-allowed opacity-50";

export function AddJobButton({ isDisabled = false, status }: AddJobButtonProps) {
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

  // Build query string with optional status parameter
  const queryParams = new URLSearchParams({ add: "true" });
  if (status) {
    queryParams.set("status", status);
  }
  const href = `${pathname}?${queryParams.toString()}`;

  return (
    <Link href={href} className={`${baseStyles} ${enabledStyles}`} aria-label="Add new job">
      <PlusIcon />
    </Link>
  );
}
