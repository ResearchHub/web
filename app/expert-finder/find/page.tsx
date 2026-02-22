import { ExpertFinderForm } from './components/ExpertFinderForm';

export default function FindExpertPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Finder for Science</h3>
      <p className="text-sm text-gray-600 mb-8">
        Paste a ResearchHub URL to find domain experts related to the content.
      </p>
      <ExpertFinderForm />
    </div>
  );
}
