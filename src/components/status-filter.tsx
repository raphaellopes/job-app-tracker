"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export function StatusFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      onChange={(e) => handleFilter(e.target.value)}
      value={searchParams.get("status") || ""}
    >
      <option value="">All Statuses</option>
      <option value="WISHLIST">Wishlist</option>
      <option value="APPLIED">Applied</option>
      <option value="INTERVIEWING">Interviewing</option>
      <option value="OFFER">Offer</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
}
