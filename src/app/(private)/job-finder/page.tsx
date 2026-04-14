import Header from "@/components/header";
import JobFinderClient from "@/components/job-finder/job-finder-client";

export default function JobFinderPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-10">
      <Header
        title="Job Finder"
        subtitle="Search live job listings and save roles to your wishlist."
        showAddButton={false}
      />
      <JobFinderClient />
    </main>
  );
}
