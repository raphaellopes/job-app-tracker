import { JobModal } from '@/components/modals/job-modal';
import { Header } from '@/components/header';
import { getFormState } from '@/utils/form-state';

export default async function Analytics(props: { searchParams: Promise<{ edit?: string; add?: string }> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  return (
    <main className="p-10">
      <Header 
        title="Analytics" 
        subtitle="Insights and statistics about your job applications"
        addButtonDisabled={isEditing || isAdding}
      />
      
      <JobModal />

      {/* Mocked Analytics Content */}
      <div className="space-y-6">
        <p className="text-gray-600">
          Analytics content will be implemented here. This will include charts, graphs, and detailed statistics about your job application progress.
        </p>
      </div>
    </main>
  );
}
