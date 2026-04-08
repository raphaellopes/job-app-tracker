import Header from "@/components/header";
import JobModal from "@/components/job/job-modal";
import JobViewModal from "@/components/job/job-view-modal";
import KanbanBoard from "@/components/kanban/kanban-board";
import SearchInput from "@/components/search-input";
import SortSelect from "@/components/sort-select";
import StatusFilter from "@/components/status-filter";

import { getJobs } from "@/actions/jobs";

import { type BoardPageSearchParams, getFormState } from "@/utils/form-job-state";
import { resolveJobViewState } from "@/utils/job-view-state";

export default async function Board(props: { searchParams: Promise<BoardPageSearchParams> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);
  const jobs = await getJobs(searchParams.search, searchParams.status, searchParams.sort);
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
          <KanbanBoard jobs={jobs} />
        </div>
      </div>
    </main>
  );
}
