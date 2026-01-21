import { Header } from '@/components/header';
import { JobModal } from '@/components/modals/job-modal';
import { getFormState } from '@/utils/form-state';

export default async function Dashboard(props: { searchParams: Promise<{ edit?: string; add?: string }> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  return (
    <main className="p-10">
      <Header 
        title="Dashboard" 
        subtitle="Welcome to your job application tracker"
        addButtonDisabled={isEditing || isAdding}
      />
      
      <JobModal />

      {/* Mocked Dashboard Content */}
      <div className="space-y-6">
        <p className="text-gray-600">
          Dashboard content will be implemented here. This will include statistics, charts, and overview of your job applications.
        </p>
      </div>
    </main>
  );
}
