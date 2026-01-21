export interface FormSearchParams {
  add?: string;
  edit?: string;
}

export function getFormState(searchParams: FormSearchParams) {
  const isAdding = searchParams.add === 'true';
  const isEditing = !!searchParams.edit;
  const showForm = isAdding || isEditing;

  return {
    isAdding,
    isEditing,
    showForm,
  };
}
