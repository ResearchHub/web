import { Globe, Star, Rocket } from 'lucide-react';

const values = [
  {
    title: 'Accessible to everyone',
    text: 'The scientific record is too important to be hidden behind paywalls and in ivory towers. ResearchHub is accessible to everybody, everywhere, with no content residing behind paywalls and no costs to participate. Summaries are written in plain English to improve accessibility.',
    icon: <Globe className="w-12 h-12 text-blue-500" />,
  },
  {
    title: 'Collaborative',
    text: 'Academic research is too siloed today. ResearchHub encourages academics and non-academics alike to interact in a public and collaborative manner. An incentive for such behavior is provided in the form of ResearchCoin.',
    icon: <Star className="w-12 h-12 text-yellow-500" />,
  },
  {
    title: 'Efficient',
    text: 'It can take 3-5 years today to go through the process of applying for funding, completing the research, submitting a paper to journals, having it reviewed, and finally getting it published. We believe research could be completed at least one order of magnitude more efficiently.',
    icon: <Rocket className="w-12 h-12 text-blue-500" />,
  },
];

export const AboutValues = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-gray-900 text-center mb-12">
          We Believe Scientific Research Should Be:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center text-center"
            >
              <div className="mb-6">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
              <p className="text-gray-600">{value.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
