export interface FormSearchParams {
  add?: string;
  edit?: string;
}

export type JobViewSearchParams = FormSearchParams & {
  view?: string;
};

export type BoardPageSearchParams = JobViewSearchParams & {
  search?: string;
  status?: string;
  sort?: string;
};

export function getFormState(searchParams: JobViewSearchParams) {
  const isAdding = searchParams.add === "true";
  const isEditing = !!searchParams.edit;
  const showForm = isAdding || isEditing;

  return {
    isAdding,
    isEditing,
    showForm,
  };
}
