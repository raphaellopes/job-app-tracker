"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "salary-desc", label: "Salary (High to Low)" },
  { value: "salary-asc", label: "Salary (Low to High)" },
];

const SortSelect: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      onChange={(e) => handleSort(e.target.value)}
      value={searchParams.get("sort") || "date-desc"}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SortSelect;
