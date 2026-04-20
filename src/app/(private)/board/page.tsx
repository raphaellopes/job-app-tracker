import Header from "@/components/header";

import {
  type BoardPageSearchParams,
  getFormState,
  JobModal,
  JobsBoardClient,
  JobViewModal,
  resolveJobViewState,
  SearchInput,
  SortSelect,
  StatusFilter,
} from "@/features/jobs";
import { getJobs } from "@/features/jobs/server/actions";

export default async function Board(props: { searchParams: Promise<BoardPageSearchParams> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);
  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    sort: searchParams.sort,
  };
  const jobs = await getJobs(filters.search, filters.status, filters.sort);
  const jobToEdit = searchParams.edit
    ? jobs.find((j) => j.id === Number(searchParams.edit))
    : undefined;
  const { jobToView, initialInterviewPrep } = await resolveJobViewState(searchParams.view, jobs);

  return (
    <main className="p-4 sm:p-6 lg:p-10 h-screen !pb-0 flex flex-col">
      <Header
        title="Board"
        subtitle="Manage and view all your job applications"
        addButtonDisabled={isEditing || isAdding}
      />

      <JobModal job={jobToEdit} />
      <JobViewModal job={jobToView} initialInterviewPrep={initialInterviewPrep} />

      <div className="space-y-4 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-4 mb-6">
          <SearchInput />
          <StatusFilter />
          <SortSelect />
        </div>
        <div className="w-full flex flex-1">
          <JobsBoardClient initialJobs={jobs} filters={filters} />
        </div>
      </div>
    </main>
  );
}
