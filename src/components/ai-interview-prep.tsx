"use client";

const MOCK_PREP_ITEMS = [
  "Tell me about yourself in 60 seconds.",
  "Why are you interested in this company?",
  "Describe a recent project and your impact.",
];

export function AIInterviewPrep() {
  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <h3 className="text-sm font-semibold text-blue-900">AI Interview Prep</h3>
      <p className="mt-1 text-sm text-blue-800">Mocked suggestions for your next interview.</p>

      <ul className="mt-3 space-y-2">
        {MOCK_PREP_ITEMS.map((item) => (
          <li key={item} className="rounded-md bg-white px-3 py-2 text-sm text-gray-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
