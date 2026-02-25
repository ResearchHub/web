import { ExpertFinderForm } from './components/ExpertFinderForm';

export default function FindExpertPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Finder for Science</h3>
      <p className="text-sm text-gray-600 mb-8">
        Paste a ResearchHub paper or post URL to discover domain experts, or use the “Find experts”
        button on any Work details page to start from that content.
      </p>
      <ExpertFinderForm />
    </div>
  );
}
