import { Suspense } from "react";

import Header from "@/components/header";

import {
  type BoardPageSearchParams,
  getFormState,
  JobModal,
  JobsBoardClient,
  JobViewModal,
  SearchInput,
  SortSelect,
  StatusFilter,
} from "@/features/jobs";
import JobViewModalFallback from "@/features/jobs/components/job-view-modal-fallback";
import { getJobs } from "@/features/jobs/server/actions";

export default async function Board(props: { searchParams: Promise<BoardPageSearchParams> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  return (
    <main className="p-4 sm:p-6 lg:p-10 h-screen !pb-0 flex flex-col">
      <Header
        title="Board"
        subtitle="Manage and view all your job applications"
        addButtonDisabled={isEditing || isAdding}
      />

      <Suspense
        fallback={<BoardContentFallback showJobViewFallback={Boolean(searchParams.view)} />}
      >
        <BoardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BoardContent({ searchParams }: { searchParams: BoardPageSearchParams }) {
  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    sort: searchParams.sort,
  };
  const jobs = await getJobs(filters.search, filters.status, filters.sort);

  const getJobToView = (jobId?: string) => {
    return jobId ? jobs.find((j) => j.id === Number(jobId)) : undefined;
  };

  const jobToEdit = getJobToView(searchParams.edit);
  const jobToView = getJobToView(searchParams.view);

  return (
    <>
      <JobModal job={jobToEdit} />
      <JobViewModal job={jobToView} filters={filters} />

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
    </>
  );
}

function BoardContentFallback({ showJobViewFallback }: { showJobViewFallback: boolean }) {
  return (
    <>
      {showJobViewFallback ? <JobViewModalFallback /> : null}
      <div className="space-y-4 flex-1 flex flex-col animate-pulse">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="h-10 w-48 rounded bg-gray-200" />
          <div className="h-10 w-40 rounded bg-gray-200" />
          <div className="h-10 w-40 rounded bg-gray-200" />
        </div>
        <div className="w-full flex flex-1 rounded-lg border border-gray-100 bg-white" />
      </div>
    </>
  );
}
