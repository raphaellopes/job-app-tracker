import ProgressBar from "@/components/progress-bar";

interface InterviewPrepMatchScoreProps {
  score: number;
}

const MIN_SCORE = 0;
const MAX_SCORE = 100;

const InterviewPrepMatchScore: React.FC<InterviewPrepMatchScoreProps> = ({ score }) => {
  const clamped = Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
  const displayPercent = Math.round(clamped);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Match score</p>
        <p className="text-sm text-gray-600">{displayPercent}%</p>
      </div>
      <ProgressBar value={clamped} aria-label="Resume match score" />
    </div>
  );
};

export default InterviewPrepMatchScore;
