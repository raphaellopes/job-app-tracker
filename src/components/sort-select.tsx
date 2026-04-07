"use client";

import { usePathname, useRouter,useSearchParams } from "next/navigation";

const SortSelect: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      onChange={(e) => handleSort(e.target.value)}
      value={searchParams.get("sort") || "date-desc"}
    >
      <option value="date-desc">Newest First</option>
      <option value="date-asc">Oldest First</option>
      <option value="salary-desc">Salary (High to Low)</option>
      <option value="salary-asc">Salary (Low to High)</option>
    </select>
  );
};

export default SortSelect;
