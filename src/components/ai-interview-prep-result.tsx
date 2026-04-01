import type { InterviewPrepResult } from "@/actions/gemini-service";
import InterviewPrepMatchScore from "@/components/interview-prep-match-score";
import TagChipList from "@/components/tag-chip-list";

interface AIInterviewPrepResultProps {
  result: InterviewPrepResult;
}

const AIInterviewPrepResult: React.FC<AIInterviewPrepResultProps> = ({ result }) => {
  return (
    <div className="mt-4 space-y-5 border-t border-blue-100 pt-4">
      <InterviewPrepMatchScore score={result.resumeMatchScore} />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Recommended keywords</p>
        <TagChipList tags={result.suggestedSkills} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Likely questions</p>
        <ul className="space-y-2">
          {result.mockQuestions.map((question) => (
            <li
              key={question}
              className="rounded-lg border border-blue-100 bg-white/80 px-3 py-2.5 text-sm text-gray-800"
            >
              {question}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> {result.tips}
        </p>
      </div>
    </div>
  );
};

export default AIInterviewPrepResult;
